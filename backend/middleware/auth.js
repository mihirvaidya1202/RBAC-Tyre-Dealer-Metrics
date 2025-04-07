const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = (roles = []) => async (req, res, next) => {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ 
      success: false,
      message: 'Authorization header missing or invalid',
      code: 'MISSING_AUTH_HEADER'
    });
  }

  const token = authHeader.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    if (roles.length && !roles.includes(user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
        code: 'FORBIDDEN'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Token verification failed:', error.message);
    res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
      code: 'INVALID_TOKEN'
    });
  }
};

module.exports = auth;