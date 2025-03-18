const express = require('express');
const { getAllTyres, getTyreDetails, buyTyre, getPurchaseHistory } = require('../controllers/customerController');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/tyres', (req, res, next) => {
    getAllTyres(req, res, next);
});

router.get('/tyres/:tyreModel/:tyreSize', (req, res, next) => {
    getTyreDetails(req, res, next);
});

router.post('/buy', auth(['customer']), (req, res, next) => {
    buyTyre(req, res, next);
});

router.get('/purchase-history', (req, res, next) => {
    getPurchaseHistory(req, res, next);
});

module.exports = router;