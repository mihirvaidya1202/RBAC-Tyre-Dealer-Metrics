const express = require('express');
const { 
  addTyreStock, 
  fetchTyreStocks, 
  buyTyreStock, 
  deleteTyreStock,
  updateTyreStock
} = require('../controllers/tyreStocksController');
const auth = require('../middleware/auth');
const router = express.Router();

router.post('/', auth(['admin']), addTyreStock);

router.get('/', auth(['admin', 'dealer']), fetchTyreStocks);
  
router.post('/buy/:id', auth, buyTyreStock);

router.delete('/:id', auth(['admin']), deleteTyreStock);

router.patch('/:id', auth(['admin']), updateTyreStock);

module.exports = router;
