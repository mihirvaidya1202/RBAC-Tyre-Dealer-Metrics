require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const tyreStockRoutes = require('./routes/tyreStockRoutes');
const dealerRoutes = require('./routes/dealerRoutes');
const adminRoutes = require('./routes/adminRoutes');
const customerRoutes = require('./routes/customerRoutes');
const TyreStock = require('./models/TyreStock');

const User = require('./models/User');

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Authentication middleware
const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication required. No token found.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id || decoded._id);
    if (!req.user) return res.status(401).json({ message: 'Invalid token, user not found.' });
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token.' });
  }
};

// Register routes
app.use('/api/auth', authRoutes);
app.use('/api', userRoutes);
app.use('/api/tyre-stocks', tyreStockRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/dealer', dealerRoutes);

app.use('/api/customer', customerRoutes); // Ensure this line is present

// Start the server
const PORT = process.env.PORT || 8000;

app.get('/', (req, res) => {
  res.send('Backend server is running!');
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));