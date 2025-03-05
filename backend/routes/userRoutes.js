const express = require('express');
const { getAllUsers, getUserById, updateUser, deleteUser, getAllDealers, getAllCustomers, getAllAdmins  } = require('../controllers/userController');
const { getDealerStock  } = require('../controllers/dealerController');

const auth = require('../middleware/auth');

const router = express.Router();

router.get('/users', auth(['admin']), getAllUsers);

router.get('/users/:id', auth(['admin']), getUserById);

router.put('/users/:id', auth(['admin']), updateUser);

router.delete('/users/:id', auth(['admin']), deleteUser);

router.get('/dealers', auth(['admin']), getAllDealers);

router.get('/customers', auth(['admin']), getAllCustomers);

router.get('/admins', auth(['admin']), getAllAdmins);

router.get('/dealer/stock', auth(['dealer']), getDealerStock);

module.exports = router;