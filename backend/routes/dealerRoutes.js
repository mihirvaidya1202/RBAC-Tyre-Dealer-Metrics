const express = require('express');
const { getDealerStock, getDealerAnalytics } = require('../controllers/dealerController');
const { addToDealerStock } = require('../controllers/tyreStocksController');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/stock/add', auth(['dealer']), addToDealerStock);

router.get('/stock', auth(['dealer']), getDealerStock);

router.get('/analytics', auth(['dealer']), getDealerAnalytics);

module.exports = router;