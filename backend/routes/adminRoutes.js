const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { fetchAdminAnalytics } = require('../controllers/adminController');

router.get('/analytics', auth(['admin']), fetchAdminAnalytics);

module.exports = router;
