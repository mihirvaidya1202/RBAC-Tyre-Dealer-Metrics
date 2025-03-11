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

const TyreStock = require('./models/TyreStock');
const User = require('./models/User');

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// ✅ Authentication Middleware
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

// ✅ Route Setup
app.use('/api/auth', authRoutes);
app.use('/api', userRoutes);
app.use('/api', tyreStockRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/dealer', dealerRoutes);

// ✅ Admin Stock Update Route
app.post('/api/tyre-stocks', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Only Admins can add stock.' });
    }

    const { tyreModel, tyreSize, quantity, price } = req.body;
    if (!tyreModel || tyreSize <= 0 || quantity <= 0 || price <= 0) {
      return res.status(400).json({ message: 'Invalid input data.' });
    }

    const newStock = new TyreStock({ tyreModel, tyreSize, quantity, price });
    await newStock.save();
    res.status(201).json(newStock);
  } catch (error) {
    res.status(500).json({ message: 'Error adding tyre stock', error: error.message });
  }
});

// ✅ Fetch Tyre Stocks
app.get('/api/tyre-stocks', async (req, res) => {
  try {
    const { dealerId } = req.query;
    const query = dealerId ? { dealerId } : {};
    const tyreStocks = await TyreStock.find(query);
    res.status(200).json(tyreStocks);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching tyre stocks' });
  }
});

// ✅ Buy Tyre Stocks (Admin Stock Deduction)
app.post('/api/tyre-stocks/buy/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;
    
    if (!id || !quantity || quantity <= 0) {
      return res.status(400).json({ message: 'Invalid input data' });
    }

    const tyreStock = await TyreStock.findById(id);
    if (!tyreStock || tyreStock.quantity < quantity) {
      return res.status(400).json({ message: 'Insufficient stock' });
    }

    tyreStock.quantity -= quantity;
    await tyreStock.save();
    
    res.status(200).json({ message: 'Stock purchased', remainingStock: tyreStock.quantity });
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong', error: error.message });
  }
});

// ✅ Add to Dealer Stock
app.post('/api/dealer/stock/add', authenticate, async (req, res) => {
  try {
    const { stockId, quantity } = req.body;
    const dealerId = req.user._id;

    const stock = await TyreStock.findById(stockId);
    if (!stock || stock.quantity < quantity) {
      return res.status(400).json({ message: 'Not enough stock available' });
    }

    const dealer = await User.findById(dealerId);
    if (!dealer) return res.status(404).json({ message: 'Dealer not found' });

    const existingStock = dealer.dealerStock.find(item => item.tyreStockId.equals(stock._id));
    if (existingStock) {
      existingStock.quantity += quantity;
    } else {
      dealer.dealerStock.push({
        tyreStockId: stock._id,
        tyreModel: stock.tyreModel,
        tyreSize: stock.tyreSize,
        price: stock.price,
        quantity: quantity,
      });
    }

    stock.quantity -= quantity;
    await stock.save();
    await dealer.save();

    res.status(200).json({ message: 'Stock added to dealer', remainingStock: stock.quantity });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
