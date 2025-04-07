const User = require('../models/User');
const Dealer = require('../models/Dealer');
const TyreStock = require('../models/TyreStock');
const Customer = require('../models/Customer');
const { verifyToken } = require('../utils/jwt');

exports.getDealerStock = async (req, res) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        message: 'Authorization token is required',
        code: 'UNAUTHORIZED'
      });
    }
  
    try {
      const decoded = verifyToken(token);
      
      if (!decoded?.id) {
        return res.status(403).json({ 
          message: 'Invalid token payload',
          code: 'FORBIDDEN'
        });
      }
  
      const dealerId = decoded.id;
      const dealer = await Dealer.findById(dealerId).populate('dealerStock.tyreStockId');
      
      if (!dealer) {
        return res.status(404).json({ 
          message: 'Dealer not found',
          code: 'NOT_FOUND'
        });
      }
  
      res.status(200).json(dealer.dealerStock);
    } catch (error) {
      if (error.name === 'JsonWebTokenError') {
        return res.status(403).json({ 
          message: 'Invalid or expired token',
          code: 'FORBIDDEN'
        });
      }
      
      console.error('Error fetching dealer stock:', error);
      res.status(500).json({ 
        message: 'Internal Server Error', 
        error: error.message,
        code: 'SERVER_ERROR'
      });
    }
  };
  
  exports.getDealerAnalytics = async (req, res) => {
      try {
          if (!req.user?._id) {
              return res.status(403).json({ 
                  message: "Authentication required",
                  code: 'FORBIDDEN'
              });
          }
  
          const dealerId = req.user._id;
          const dealer = await Dealer.findById(dealerId).select('username dealerStock averageRating');
  
          if (!dealer) {
              return res.status(404).json({ 
                  message: "Dealer not found",
                  code: 'NOT_FOUND'
              });
          }
  
          const customers = await Customer.find({ 'orderHistory.dealerId': dealerId });
  
          const tyreSales = {};
          let totalDealerRating = 0;
          let totalDealerRatingsCount = 0;
  
          customers.forEach(customer => {
              customer.orderHistory.forEach(order => {
                  if (order.dealerId.toString() === dealerId.toString()) {
                      if (order.orderDealerRating > 0) {
                          totalDealerRating += order.orderDealerRating;
                          totalDealerRatingsCount++;
                      }
  
                      tyreSales[order.tyreId] = (tyreSales[order.tyreId] || 0) + order.quantity;
                  }
              });
          });
  
          const averageDealerRating = totalDealerRatingsCount > 0 
              ? (totalDealerRating / totalDealerRatingsCount).toFixed(2) 
              : 0;
  
          const tyresSold = await Promise.all(
              Object.keys(tyreSales).map(async (tyreId) => {
                  const tyre = await TyreStock.findById(tyreId).select('tyreModel');
                  return {
                      tyreId,
                      tyreModel: tyre?.tyreModel || 'Unknown Tyre',
                      quantitySold: tyreSales[tyreId]
                  };
              })
          );
  
          tyresSold.sort((a, b) => b.quantitySold - a.quantitySold);
  
          res.status(200).json({
              name: dealer.username,
              averageRating: averageDealerRating,
              tyresSold: tyresSold || []
          });
      } catch (err) {
          console.error("Error fetching dealer analytics:", err);
          res.status(500).json({ 
              message: "Failed to fetch dealer analytics", 
              error: err.message,
              code: 'SERVER_ERROR'
          });
      }
  };