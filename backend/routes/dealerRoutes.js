const express = require('express');
const auth = require('../middleware/auth');
const { getDealerStock } = require('../controllers/dealerController');
const { addToDealerStock } = require('../controllers/tyreStocksController');

const router = express.Router();

router.get('/stock', auth(['dealer']), getDealerStock);
router.post('/add/:id', auth(['dealer']), addToDealerStock);

module.exports = router;
