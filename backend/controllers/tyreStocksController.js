const User = require('../models/User');
const TyreStock = require('../models/TyreStock');
const Dealer = require('../models/Dealer');
const { verifyToken } = require('../utils/jwt');

exports.addToDealerStock = async (req, res) => {
    try {
      const { stockId, quantity } = req.body;
  
      const dealerId = req.user._id;
  
      const stock = await TyreStock.findById(stockId);
      if (!stock || stock.quantity < quantity) {
        console.error('Not enough stock available');
        return res.status(400).json({ message: 'Not enough stock available' });
      }
  
      const dealer = await User.findById(dealerId);
      if (!dealer) {
        console.error('Dealer not found');
        return res.status(404).json({ message: 'Dealer not found' });
      }
  
      const existingStock = dealer.dealerStock.find(item => item.tyreStockId.equals(stock._id));
      if (existingStock) {
        existingStock.quantity += quantity;
      } else {
        dealer.dealerStock.push({
          tyreStockId: stock._id,
          tyreModel: stock.tyreModel,
          tyreSize: stock.tyreSize,
          price: stock.price,
          quantity: quantity,
        });
      }
  
      stock.quantity -= quantity;
      await stock.save();
      await dealer.save();
  
      res.status(200).json({ message: 'Stock added to dealer', remainingStock: stock.quantity });
    } catch (error) {
      console.error('Error in addToDealerStock:', error);
      res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
};

exports.buyTyreStock = async (req, res) => {
    const { id } = req.params;
    const { quantity } = req.body;
    const token = req.header('Authorization')?.replace('Bearer ', '');

    try {
        const decoded = verifyToken(token);
        const dealerId = decoded.id;

        if (!id || !quantity || isNaN(quantity) || quantity <= 0) {
            return res.status(400).json({ message: 'Invalid input data' });
        }

        const tyreStock = await TyreStock.findById(id);
        if (!tyreStock) {
            return res.status(404).json({ message: 'Tyre stock not found' });
        }

        if (tyreStock.quantity < quantity) {
            return res.status(400).json({ message: 'Insufficient stock' });
        }

        tyreStock.quantity -= quantity;
        await tyreStock.save();

        let dealer = await Dealer.findById(dealerId);

        if (!dealer) {
            return res.status(404).json({ message: 'Dealer not found' });
        }

        const existingStock = dealer.dealerStock.find(stock => stock.tyreStockId.toString() === id);
        if (existingStock) {
            existingStock.quantity += quantity;
        } else {
            dealer.dealerStock.push({
                tyreStockId: id,
                tyreModel: tyreStock.tyreModel,
                tyreSize: tyreStock.tyreSize,
                price: tyreStock.price,
                quantity,
            });
        }

        await dealer.save();

        res.status(200).json({ message: 'Purchase successful', dealerStock: dealer.dealerStock });
    } catch (error) {
        console.error('Error buying tyre stock:', error);
        res.status(500).json({ message: error.message || 'Something went wrong' });
    }
};

exports.getAllTyresWithDealers = async (req, res) => {
    try {
        const tyres = await TyreStock.find();
        const dealers = await Dealer.find({ 'dealerStock.quantity': { $gt: 0 } });

        const dealerMap = {};
        dealers.forEach(dealer => {
            dealer.dealerStock.forEach(stock => {
                if (!dealerMap[stock.tyreModel]) dealerMap[stock.tyreModel] = [];
                dealerMap[stock.tyreModel].push({
                    dealerId: dealer._id,
                    dealerName: dealer.name,
                    stock: stock.quantity,
                });
            });
        });

        const tyresWithDealers = tyres.map(tyre => ({
            ...tyre.toObject(),
            dealers: dealerMap[tyre.tyreModel] || [],
        })).filter(tyre => tyre.dealers.length > 0);

        res.status(200).json(tyresWithDealers);
    } catch (error) {
        console.error('Error fetching tyres with dealers:', error);
        res.status(500).json({ message: 'Error fetching tyres', error: error.message });
    }
};

exports.addTyreStock = async (req, res) => {
    try {
        const { tyreModel, tyreSize, quantity, price } = req.body;
        if (!tyreModel || tyreSize <= 0 || quantity <= 0 || price <= 0) {
            return res.status(400).json({ message: 'Invalid input data.' });
        }

        const newStock = new TyreStock({ tyreModel, tyreSize, quantity, price });
        await newStock.save();
        res.status(201).json(newStock);
    } catch (error) {
        console.error('Error in addTyreStock:', error);
        res.status(500).json({ message: 'Error adding tyre stock', error: error.message });
    }
};

exports.fetchTyreStocks = async (req, res) => {
    try {
      const tyreStocks = await TyreStock.find();
      res.status(200).json(tyreStocks);
    } catch (error) {
      console.error('Error fetching tyre stocks:', error);
      res.status(500).json({ message: 'Error fetching tyre stocks', error: error.message });
    }
};

exports.deleteTyreStock = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedStock = await TyreStock.findByIdAndDelete(id);
        if (!deletedStock) {
            return res.status(404).json({ message: 'Tyre stock not found' });
        }
        res.status(200).json({ message: 'Tyre stock deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting tyre stock', error: error.message });
    }
};
