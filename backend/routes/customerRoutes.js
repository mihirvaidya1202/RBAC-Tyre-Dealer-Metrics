const express = require('express');
const {
    getAllTyres,
    getTyreDetails,
    buyTyre,
    getPurchaseHistory,
    updateDealerRating,
    updateTyreRating,
} = require('../controllers/customerController');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/tyres', auth(['customer']), (req, res, next) => {
    getAllTyres(req, res, next);
});

router.get('/tyres/:tyreModel/:tyreSize', auth(['customer']), (req, res, next) => {
    getTyreDetails(req, res, next);
});

router.post('/buy', auth(['customer']), (req, res, next) => {
    buyTyre(req, res, next);
});

router.get('/purchase-history', auth(['customer']), (req, res, next) => {
    getPurchaseHistory(req, res, next);
});

router.post('/update-dealer-rating', auth(['customer']), (req, res, next) => {
    updateDealerRating(req, res, next);
});

router.post('/update-tyre-rating', auth(['customer']), (req, res, next) => {
    updateTyreRating(req, res, next);
});

module.exports = router;