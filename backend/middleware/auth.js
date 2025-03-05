const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = (allowedRoles) => async (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];

  if (!token) return res.status(403).json({ message: 'Access denied. No token provided.' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(403).json({ message: 'User not found' });
    }

    if (allowedRoles && !allowedRoles.includes(user.role.toLowerCase())) {
      return res.status(403).json({ message: 'Access denied. Unauthorized role.' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
};

module.exports = auth;
