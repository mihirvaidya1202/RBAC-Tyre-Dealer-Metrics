const User = require('../models/User');
const Dealer = require('../models/Dealer');
const Customer = require('../models/Customer');
const Admin = require('../models/Admin');

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, '-password');
    res.json(users);
  } catch (err) {
    console.error('Failed to fetch users:', err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

exports.getUserById = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findById(id, '-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (err) {
    console.error('Failed to fetch user:', err);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};

exports.updateUser = async (req, res) => {
  const { id } = req.params;
  const { email, username, role } = req.body;

  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (email) user.email = email;
    if (username) user.username = username;
    if (role) user.role = role;

    await user.save();

    res.json({ message: 'User updated successfully', user });
  } catch (err) {
    console.error('Failed to update user:', err);
    res.status(500).json({ error: 'Failed to update user' });
  }
};

exports.deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('Failed to delete user:', err);
    res.status(500).json({ error: 'Failed to delete user' });
  }
};

exports.getAllDealers = async (req, res) => {
  try {
    const dealers = await Dealer.find({}, '-password');
    res.json(dealers);
  } catch (err) {
    console.error('Failed to fetch dealers:', err);
    res.status(500).json({ error: 'Failed to fetch dealers' });
  }
};

exports.getAllCustomers = async (req, res) => {
  try {
    const customers = await Customer.find({}, '-password');
    res.json(customers);
  } catch (err) {
    console.error('Failed to fetch customers:', err);
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
};

exports.getAllAdmins = async (req, res) => {
  try {
    const admins = await Admin.find({}, '-password');
    res.json(admins);
  } catch (err) {
    console.error('Failed to fetch admins:', err);
    res.status(500).json({ error: 'Failed to fetch admins' });
  }
};
