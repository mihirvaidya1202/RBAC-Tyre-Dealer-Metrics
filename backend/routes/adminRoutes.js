const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getAdminAnalytics } = require('../controllers/adminController');

router.get('/analytics', auth(['admin']), getAdminAnalytics);

module.exports = router;
