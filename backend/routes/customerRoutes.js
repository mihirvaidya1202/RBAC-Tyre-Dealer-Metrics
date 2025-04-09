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

router.get('/tyres', auth(['customer']), getAllTyres);

router.get('/tyres/:tyreModel/:tyreSize', auth(['customer']), getTyreDetails);

router.post('/buy', auth(['customer']), buyTyre);

router.get('/purchase-history', auth(['customer']), getPurchaseHistory);

router.post('/update-dealer-rating', auth(['customer']), updateDealerRating);

router.post('/update-tyre-rating', auth(['customer']), updateTyreRating);

module.exports = router;