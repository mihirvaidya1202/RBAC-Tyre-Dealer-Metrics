const Dealer = require('../models/Dealer');
const Customer = require('../models/Customer');
const Admin = require('../models/Admin');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { generateToken } = require('../utils/jwt');
const bcrypt = require('bcryptjs');

exports.register = async (req, res) => {
  const { username, password, role } = req.body;

  try {
    const existingDealer = await Dealer.findOne({ username });
    const existingCustomer = await Customer.findOne({ username });
    const existingAdmin = await Admin.findOne({ username });

    if (existingDealer || existingCustomer || existingAdmin) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    let newUser;
    switch (role.toLowerCase()) {
      case "dealer":
        newUser = new Dealer({ email, username, password, role });
        break;
      case "customer":
        newUser = new Customer({ email, username, password, role });
        break;
      case "admin":
        newUser = new Admin({ email, username, password, role });
        break;
      default:
        return res.status(400).json({ message: "Invalid role" });
    }

    await newUser.save();

    const token = generateToken(user);

    res.status(201).json({ message: 'User registered successfully', token });
  } catch (err) {
    console.error('Registration Error:', err);
    res.status(500).json({ error: 'Registration failed' });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Missing username or password" });
    }

    const user = await User.findOne({ username });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'your_secret_key',
      { expiresIn: '1h' }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      role: user.role
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Login failed", error: error.message });
  }
};
