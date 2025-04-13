const jwt = require('jsonwebtoken');
const secret = process.env.JWT_SECRET;

if (!secret) {
  throw new Error('JWT_SECRET is not defined in the environment variables.');
}

const generateToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, secret, { expiresIn: '1h' });
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, secret);
  } catch (error) {
    console.error('Token verification failed from jwt:', error.message);
    throw new Error('Invalid or expired token');
  }
};

const authMiddleware = (allowedRoles) => (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ 
      success: false,
      message: 'Authentication required. No token found.',
      code: 'UNAUTHORIZED'
    });
  }

  try {
    const decoded = verifyToken(token);

    if (allowedRoles && !allowedRoles.includes(decoded.role)) {
      return res.status(403).json({ 
        success: false,
        message: 'Forbidden - Insufficient permissions',
        code: 'FORBIDDEN'
      });
    }

    if (decoded.exp && Date.now() >= decoded.exp * 1000) {
      return res.status(401).json({
        success: false,
        message: 'Token expired',
        code: 'TOKEN_EXPIRED'
      });
    }

    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ 
      success: false,
      message: error.message,
      code: 'INVALID_TOKEN'
    });
  }
};

module.exports = { 
  generateToken, 
  verifyToken, 
  authMiddleware 
};