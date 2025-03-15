const User = require('../models/User');

const getAdminAnalytics = async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: "Access denied. Admins only." });
    }

    try {
        const dealers = await User.find({ role: "dealer" })
            .populate("dealerStock.tyreStockId", "tyreModel tyreSize quantity price");

        if (!dealers.length) {
            console.error("No dealers found!");
        }

        const analyticsData = dealers.map(dealer => ({
            dealerName: dealer.username,
            email: dealer.email,
            stocks: dealer.dealerStock.map(stock => ({
                tyreModel: stock.tyreModel,
                tyreSize: stock.tyreSize,
                quantity: stock.quantity,
            }))
        }));

        res.json(analyticsData);
    } catch (error) {
        console.error("Error in Admin Analytics:", error);
        res.status(500).json({ message: "Error fetching admin analytics", error: error.message });
    }
};

module.exports = { getAdminAnalytics };
