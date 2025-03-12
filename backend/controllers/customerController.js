const TyreStock = require('../models/TyreStock');
const Dealer = require('../models/Dealer');

exports.getAllTyres = async (req, res) => {
    try {
        const tyres = await TyreStock.find({ quantity: { $gt: 0 } });
        res.json(tyres);
    } catch (error) {
        res.status(500).json({ message: "Error fetching tyres", error: error.message });
    }
};

exports.getTyreDetails = async (req, res) => {
    try {
        const { tyreModel } = req.params;
        const tyres = await TyreStock.find({ tyreModel, quantity: { $gt: 0 } })
            .populate('dealerId', 'dealerName email');

        if (!tyres.length) {
            return res.status(404).json({ message: "Tyre not found or out of stock" });
        }

        res.json(tyres);
    } catch (error) {
        res.status(500).json({ message: "Error fetching tyre details", error: error.message });
    }
};

exports.buyTyre = async (req, res) => {
    try {
        const { dealerId, tyreModel, quantity } = req.body;

        const dealer = await Dealer.findById(dealerId);
        if (!dealer) {
            return res.status(404).json({ message: "Dealer not found" });
        }

        const tyreStock = dealer.dealerStock.find(stock => stock.tyreModel === tyreModel);
        if (!tyreStock || tyreStock.quantity < quantity) {
            return res.status(400).json({ message: "Insufficient stock" });
        }

        tyreStock.quantity -= quantity;

        if (tyreStock.quantity === 0) {
            dealer.dealerStock = dealer.dealerStock.filter(stock => stock.tyreModel !== tyreModel);
        }

        await dealer.save();
        res.json({ message: "Order successfully placed", remainingStock: tyreStock.quantity });

    } catch (error) {
        res.status(500).json({ message: "Error processing order", error: error.message });
    }
};
