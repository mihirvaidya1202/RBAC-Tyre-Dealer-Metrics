const express = require('express');
const authenticate = require('../middleware/auth');
const { getAllTyres, getTyreDetails, buyTyre } = require('../controllers/customerController');

const router = express.Router();

router.get('/tyres', getAllTyres);

router.get('/tyres/:tyreModel', getTyreDetails);

router.post('/buy', authenticate, buyTyre);

module.exports = router;