const express = require('express');
const { buyTyreStock } = require('../controllers/tyreStocksController');
const { authMiddleware } = require('../utils/jwt');

const router = express.Router();

router.post('/:id/buy', authMiddleware(['dealer']), buyTyreStock);

module.exports = router;