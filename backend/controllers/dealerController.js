const Dealer = require('../models/Dealer');

exports.getDealerStock = async (req, res) => {
    try {
        const dealerId = req.user.id;

        const dealer = await Dealer.findById(dealerId);

        if (!dealer || !dealer.dealerStock.length) {
            return res.status(404).json({ message: "No stock found for this dealer" });
        }

        res.json(dealer.dealerStock);
    } catch (error) {
        console.error("🚨 Error fetching dealer stock:", error);
        res.status(500).json({ message: "Server error" });
    }
};
