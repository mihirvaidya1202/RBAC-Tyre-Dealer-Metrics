const User = require('../models/User');
const Dealer = require('../models/Dealer');
const TyreStock = require('../models/TyreStock');
const { verifyToken } = require('../utils/jwt');

exports.addToDealerStock = async (req, res) => {
    try {
      const { stockId, quantity } = req.body;
      const dealerId = req.user._id;
  
      const stock = await TyreStock.findById(stockId);
      if (!stock || stock.quantity < quantity) {
        console.error('Not enough stock available'); // Log if stock is insufficient
        return res.status(400).json({ message: 'Not enough stock available' });
      }
  
      const dealer = await User.findById(dealerId);
      if (!dealer) {
        console.error('Dealer not found'); // Log if dealer is not found
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

// Fetch dealer stock
exports.getDealerStock = async (req, res) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  try {
    const decoded = verifyToken(token);
    const dealerId = decoded.id;

    const dealer = await Dealer.findById(dealerId).populate('dealerStock.tyreStockId');
    if (!dealer) {
      console.error("Dealer not found:", dealerId);
      return res.status(404).json({ message: 'Dealer not found' });
    }

    res.status(200).json(dealer.dealerStock);
  } catch (error) {
    console.error('Error fetching dealer stock:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};

// Fetch dealer analytics
exports.getDealerAnalytics = async (req, res) => {
  try {
    const dealer = await User.findById(req.user._id);
    if (!dealer) return res.status(404).json({ message: 'Dealer not found' });

    res.json({
      dealerName: dealer.name,
      stocks: dealer.dealerStock.map(stock => ({
        tyreModel: stock.tyreStockId?.tyreModel || "Unknown Model",
        tyreSize: stock.tyreStockId?.tyreSize || "Unknown Size",
        quantity: stock.quantity,
      })),
    });
  } catch (error) {
    console.error("Error fetching dealer analytics:", error);
    res.status(500).json({ message: 'Error fetching dealer analytics', error: error.message });
  }
};