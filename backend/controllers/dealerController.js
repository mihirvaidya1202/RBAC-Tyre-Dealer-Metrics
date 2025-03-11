const User = require('../models/User');

exports.getDealerStock = async (req, res) => {
    try {
        const dealerId = req.user._id;

        const dealer = await User.findById(dealerId);
        if (!dealer || !dealer.dealerStock.length) {
            return res.status(404).json({ message: "No stock found for this dealer" });
        }

        res.json(dealer.dealerStock);
    } catch (error) {
        console.error("Error fetching dealer stock:", error);
        res.status(500).json({ message: "Server error" });
    }
};

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
