require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const tyreStockRoutes = require('./routes/tyreStockRoutes');
const dealerRoutes = require('./routes/dealerRoutes');

const TyreStock = require('./models/TyreStock');
const DealerTyreStock = require('./models/DealerTyreStock');
const User = require('./models/User');

const app = express();

app.use(cors());

const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication required. No token found.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decoded.id || decoded._id);

    if (!req.user) {
      return res.status(401).json({ message: 'Invalid token, user not found.' });
    }

    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token.' });
  }
};

app.use(express.json());

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

app.use('/api/auth', authRoutes);
app.use('/api', userRoutes);
app.use('/api', tyreStockRoutes);
app.use('/api/dealer', dealerRoutes); 

app.post('/api/tyre-stocks', authenticate, async (req, res) => {
  try {
    const { tyreModel, tyreSize, quantity, price } = req.body;

    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized. Please log in.' });
    }

    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Only Admins can add stock.' });
    }

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

app.put('/api/tyre-stocks/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    const tyreStock = await TyreStock.findOne({ _id: id, dealerId: req.user._id });

    if (!tyreStock) {
      return res.status(404).json({ message: 'Tyre stock not found or unauthorized.' });
    }

    tyreStock.quantity = quantity;
    await tyreStock.save();

    res.status(200).json(tyreStock);
  } catch (error) {
    res.status(500).json({ message: 'Error updating tyre stock.', error: error.message });
  }
});

app.post('/api/tyre-stocks/buy/:id', async (req, res) => {
  try {
      const { id } = req.params;
      const { quantity } = req.body;

      if (!id || !quantity || isNaN(quantity) || quantity <= 0) {
          return res.status(400).json({ message: 'Invalid input data' });
      }

      const tyreStock = await TyreStock.findById(id);
      if (!tyreStock) {
          return res.status(404).json({ message: 'Tyre stock not found' });
      }

      if (tyreStock.quantity < quantity) {
          return res.status(400).json({ message: 'Insufficient stock' });
      }

      tyreStock.quantity -= quantity;
      await tyreStock.save();

      res.status(200).json(tyreStock);
  } catch (error) {
      res.status(500).json({ message: 'Something went wrong' });
  }
});

app.delete('/api/tyre-stocks/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const tyreStock = await TyreStock.findOne({ _id: id, dealerId: req.user._id });

    if (!tyreStock) {
      return res.status(404).json({ message: 'Tyre stock not found or unauthorized.' });
    }

    await TyreStock.findByIdAndDelete(id);
    res.status(200).json({ message: 'Tyre stock deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting tyre stock.', error: error.message });
  }
});

app.post('/api/dealer/stock/add', authenticate, async (req, res) => {
  const { stockId, quantity } = req.body;
  const dealerId = req.user._id;

  if (!stockId || !dealerId || !quantity || quantity <= 0) {
    return res.status(400).json({ message: "Stock ID, Dealer ID, and valid quantity are required" });
  }

  try {
    const stock = await TyreStock.findById(stockId);
    if (!stock) {
      return res.status(404).json({ message: "Stock not found" });
    }

    if (stock.quantity < quantity) {
      return res.status(400).json({ message: "Not enough stock available" });
    }

    let dealer = await User.findOne({ _id: dealerId, role: "dealer" }); 

    if (!dealer) {
      return res.status(404).json({ message: "Dealer not found" });
    }

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

    res.json({
      message: "Stock successfully added to dealer",
      dealerStock: dealer.dealerStock,
      remainingStock: stock.quantity,
    });

  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
});

app.delete('/api/dealer-stock/:id', async (req, res) => {
  try {
    const { id } = req.params;
    res.status(200).json({ message: 'Stock removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
