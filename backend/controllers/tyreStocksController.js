const TyreStock = require('../models/TyreStock');
const Dealer = require('../models/Dealer');
const { verifyToken } = require('../utils/jwt');

exports.addToDealerStock = async (req, res) => {
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

        res.status(200).json({ message: 'Stock added to dealer successfully', dealerStock: dealer.dealerStock });
    } catch (error) {
        console.error('Error adding to dealer stock:', error);
        res.status(500).json({ message: error.message || 'Something went wrong' });
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
