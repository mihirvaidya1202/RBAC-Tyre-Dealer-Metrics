const TyreStock = require('../models/TyreStock');
const Dealer = require('../models/Dealer');

// Fetch all tyres with dealer stock
exports.getAllTyres = async (req, res) => {
    try {
        // Fetch all tyres and populate the dealerId field with dealerStock
        const tyres = await TyreStock.find().populate({
            path: 'dealerId',
            select: 'dealerStock',
            populate: {
                path: 'dealerStock.tyreStockId',
                model: 'TyreStock',
            },
        });

        // Filter tyres that have dealerStock
        const availableTyres = tyres.filter(tyre => tyre.dealerId && tyre.dealerId.dealerStock.length > 0);

        res.status(200).json(availableTyres);
    } catch (err) {
        console.error("Error fetching tyres:", err);
        res.status(500).json({ message: "Failed to fetch tyres", error: err.message });
    }
};

// Fetch details of a specific tyre
exports.getTyreDetails = async (req, res) => {
    try {
        const { tyreModel } = req.params;

        // Find the tyre by model and populate dealerStock
        const tyre = await TyreStock.findOne({ tyreModel }).populate({
            path: 'dealerId',
            select: 'dealerStock',
            populate: {
                path: 'dealerStock.tyreStockId',
                model: 'TyreStock',
            },
        });

        if (!tyre) {
            return res.status(404).json({ message: "Tyre not found" });
        }

        res.status(200).json(tyre);
    } catch (err) {
        console.error("Error fetching tyre details:", err);
        res.status(500).json({ message: "Failed to fetch tyre details", error: err.message });
    }
};

// Handle tyre purchase
exports.buyTyre = async (req, res) => {
    try {
        const { tyreId, quantity } = req.body;
        const userId = req.user._id;

        // Find the tyre and update its stock
        const tyre = await TyreStock.findById(tyreId);
        if (!tyre) {
            return res.status(404).json({ message: "Tyre not found" });
        }

        if (tyre.quantity < quantity) {
            return res.status(400).json({ message: "Insufficient stock" });
        }

        tyre.quantity -= quantity;
        await tyre.save();

        res.status(200).json({ message: "Tyre purchased successfully", tyre });
    } catch (err) {
        console.error("Error purchasing tyre:", err);
        res.status(500).json({ message: "Failed to purchase tyre", error: err.message });
    }
};