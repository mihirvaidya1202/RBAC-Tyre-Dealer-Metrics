require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');

const TyreStock = require('./models/TyreStock');
const User = require('./models/User');

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Create new tyre stock
app.post('/api/tyre-stocks', async (req, res) => {
  try {
    const { tyreModel, tyreSize, quantity, price } = req.body;
    const newTyreStock = new TyreStock({ tyreModel, tyreSize, quantity, price });
    await newTyreStock.save();
    res.status(201).json(newTyreStock);
  } catch (error) {
    res.status(500).json({ message: 'Error adding tyre stock.', error: error.message });
  }
});

// Get all tyre stocks
app.get('/api/tyre-stocks', async (req, res) => {
  try {
    const tyreStocks = await TyreStock.find();
    res.status(200).json(tyreStocks);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching tyre stocks.', error: error.message });
  }
});

// Update tyre stock quantity
app.put('/api/tyre-stocks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;
    const updatedTyreStock = await TyreStock.findByIdAndUpdate(id, { quantity }, { new: true });
    res.status(200).json(updatedTyreStock);
  } catch (error) {
    res.status(500).json({ message: 'Error updating tyre stock.', error: error.message });
  }
});

// Buy tyre stock (dealer purchase)
app.post('/api/tyre-stocks/:id/buy', async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;
    const tyreStock = await TyreStock.findById(id);

    if (!tyreStock) {
      return res.status(404).json({ message: 'Tyre stock not found.' });
    }

    if (tyreStock.quantity < quantity) {
      return res.status(400).json({ message: 'Insufficient stock.' });
    }

    // Deduct stock quantity
    tyreStock.quantity -= quantity;
    await tyreStock.save();

    res.status(200).json({ message: 'Purchase successful.', tyreStock });
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong.', error: error.message });
  }
});

// Delete tyre stock
app.delete('/api/tyre-stocks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await TyreStock.findByIdAndDelete(id);
    res.status(200).json({ message: 'Tyre stock deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting tyre stock.', error: error.message });
  }
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
