const express = require('express');
const { getAllUsers } = require('../controllers/userController');
const auth = require('../middleware/auth');
const router = express.Router();

router.get('/users', auth(['admin']), getAllUsers);

module.exports = router;