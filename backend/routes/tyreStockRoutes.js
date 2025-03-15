const express = require('express');
const { addTyreStock, fetchTyreStocks, buyTyreStock, deleteTyreStock } = require('../controllers/tyreStocksController');
const auth = require('../middleware/auth');

const router = express.Router();

// Add tyre stock (ensure it uses authentication middleware)
router.post('/', auth(['admin']), addTyreStock);

// Fetch tyre stocks
router.get('/', auth(['admin', 'dealer']), fetchTyreStocks);
  
// Buy tyre stock
router.post('/buy/:id', auth, buyTyreStock);

// Delete tyre stock
router.delete('/:id', auth, deleteTyreStock);

module.exports = router;
