const User = require('../models/User');
const Dealer = require('../models/Dealer');
const TyreStock = require('../models/TyreStock');
const Customer = require('../models/Customer');
const { verifyToken } = require('../utils/jwt');

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

exports.getDealerAnalytics = async (req, res) => {
    try {
        const dealerId = req.user._id;

        const dealer = await Dealer.findById(dealerId).select('username dealerStock averageRating');

        if (!dealer) {
            return res.status(404).json({ message: "Dealer not found" });
        }

        const customers = await Customer.find({ 'orderHistory.dealerId': dealerId });

        if (!customers || customers.length === 0) {
            return res.status(404).json({ message: "No orders found for this dealer" });
        }

        let totalDealerRating = 0;
        let totalDealerRatingsCount = 0;

        const tyreSales = {};

        customers.forEach(customer => {
            customer.orderHistory.forEach(order => {
                if (order.dealerId.toString() === dealerId.toString()) {
                    if (order.orderDealerRating > 0) {
                        totalDealerRating += order.orderDealerRating;
                        totalDealerRatingsCount++;
                    }

                    if (tyreSales[order.tyreId]) {
                        tyreSales[order.tyreId] += order.quantity;
                    } else {
                        tyreSales[order.tyreId] = order.quantity;
                    }
                }
            });
        });

        const averageDealerRating = totalDealerRatingsCount > 0 ? (totalDealerRating / totalDealerRatingsCount).toFixed(2) : 0;

        const tyresSold = await Promise.all(
            Object.keys(tyreSales).map(async (tyreId) => {
                const tyre = await TyreStock.findById(tyreId).select('tyreModel');
                return {
                    tyreId,
                    tyreModel: tyre ? tyre.tyreModel : 'Unknown Tyre',
                    quantitySold: tyreSales[tyreId]
                };
            })
        );

        tyresSold.sort((a, b) => b.quantitySold - a.quantitySold);

        res.status(200).json({
            name: dealer.username,
            averageRating: averageDealerRating,
            tyresSold
        });
    } catch (err) {
        console.error("Error fetching dealer analytics:", err);
        res.status(500).json({ message: "Failed to fetch dealer analytics", error: err.message });
    }
};