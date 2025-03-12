const express = require('express');
const { buyTyreStock, getAllTyresWithDealers  } = require('../controllers/tyreStocksController');
const { authMiddleware } = require('../utils/jwt');

const router = express.Router();

router.post('/:id/buy', authMiddleware(['dealer']), buyTyreStock);

router.get("/", getAllTyresWithDealers);

module.exports = router;