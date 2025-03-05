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
    throw new Error('Invalid or expired token');
  }
};

const authMiddleware = (allowedRoles) => (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    const decoded = verifyToken(token);

    if (!allowedRoles.includes(decoded.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
};

module.exports = { generateToken, verifyToken, authMiddleware };