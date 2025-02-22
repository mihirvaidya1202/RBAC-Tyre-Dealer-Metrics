const { verifyToken } = require('../utils/jwt');

const auth = (roles) => (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).send('Access denied. No token provided.');

  try {
    const decoded = verifyToken(token);
    if (!roles.includes(decoded.role)) {
      return res.status(403).send('Forbidden. Insufficient permissions.');
    }
    req.user = decoded;
    next();
  } catch (err) {
    res.status(400).send('Invalid token.');
  }
};

module.exports = auth;