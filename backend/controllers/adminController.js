const User = require('../models/User');

const fetchAdminAnalytics = async (req, res) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
        return res.status(401).json({ 
            message: 'Authorization token is required',
            code: 'UNAUTHORIZED'
        });
    }

    try {
        if (req.user?.role !== 'admin') {
            return res.status(403).json({ 
                message: "Access denied. Admins only.",
                code: 'FORBIDDEN'
            });
        }

        const dealers = await User.find({ role: "dealer" })
            .populate("dealerStock.tyreStockId", "tyreModel tyreSize quantity price");

        const analyticsData = dealers.map(dealer => ({
            dealerName: dealer.username,
            email: dealer.email,
            stocks: dealer.dealerStock.map(stock => ({
                tyreModel: stock.tyreStockId?.tyreModel || 'Unknown Model',
                tyreSize: stock.tyreStockId?.tyreSize || 'N/A',
                quantity: stock.quantity,
                price: stock.tyreStockId?.price || 0
            })).filter(stock => stock.quantity > 0),
            averageRating: dealer.averageRating
        }));

        res.status(200).json(analyticsData);
    } catch (error) {
        console.error("Error in Admin Analytics:", error);
        res.status(500).json({ 
            message: "Error fetching admin analytics", 
            error: error.message,
            code: 'SERVER_ERROR'
        });
    }
};

module.exports = { fetchAdminAnalytics };