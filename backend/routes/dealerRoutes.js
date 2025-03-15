const express = require('express');
const { getDealerStock, getDealerAnalytics } = require('../controllers/dealerController');
const { addToDealerStock } = require('../controllers/tyreStocksController');
const auth = require('../middleware/auth');

const router = express.Router();

// Add stock to dealer
router.post('/stock/add', auth(['dealer']), addToDealerStock);

// Fetch dealer stock
router.get('/stock', auth(['dealer']), getDealerStock);

// Fetch dealer analytics
router.get('/analytics', auth(['dealer']), getDealerAnalytics);

module.exports = router;