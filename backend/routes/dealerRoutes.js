const express = require('express');
const authenticate = require('../middleware/auth');
const { getDealerStock, getDealerAnalytics } = require('../controllers/dealerController');
const { addToDealerStock } = require('../controllers/tyreStocksController');

const router = express.Router();

router.get('/stock', authenticate, getDealerStock);
router.post('/add/:id', authenticate, addToDealerStock);
router.get('/analytics', authenticate, getDealerAnalytics);

module.exports = router;
