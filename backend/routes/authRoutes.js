const express = require('express');
const { login } = require('../controllers/authController');
const Dealer = require('../models/Dealer');
const Customer = require('../models/Customer');
const Admin = require('../models/Admin');
const User = require('../models/User');

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { email, username, password, role } = req.body;

    if (!email || !username || !password || !role) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    let newUser;
    switch (role.toLowerCase()) {
      case 'dealer':
        newUser = new Dealer({ email, username, password });
        break;
      case 'customer':
        newUser = new Customer({ email, username, password });
        break;
      case 'admin':
        newUser = new Admin({ email, username, password });
        break;
      default:
        return res.status(400).json({ message: 'Invalid role' });
    }

    await newUser.save();
    res.status(201).json({ message: 'User registered successfully', user: newUser });

  } catch (error) {
    console.error('Registration error:', error.stack);
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
});

router.post('/login', login);

module.exports = router;
