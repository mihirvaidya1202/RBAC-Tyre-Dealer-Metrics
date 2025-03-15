const express = require('express');
const { getAllTyres, getTyreDetails, buyTyre } = require('../controllers/customerController');
const auth = require('../middleware/auth');

const router = express.Router();

// Fetch all tyres
router.get('/customer/tyres', (req, res, next) => {
    getAllTyres(req, res, next);
});

// Fetch details of a specific tyre
router.get('/customer/tyres/:tyreModel', (req, res, next) => {
    getTyreDetails(req, res, next);
});

// Buy a tyre
router.post('/customer/buy', auth, (req, res, next) => {
    buyTyre(req, res, next);
});

module.exports = router;