const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Tyre Stock Schema
const tyreStockSchema = new mongoose.Schema({
  tyreModel: String,
  tyreSize: String,
  quantity: Number,
  price: Number,
});

const TyreStock = mongoose.model('TyreStock', tyreStockSchema);

// API Endpoints

// Add Tyre Stock
app.post('/api/tyre-stocks', async (req, res) => {
  const { tyreModel, tyreSize, quantity, price } = req.body;
  const newTyreStock = new TyreStock({ tyreModel, tyreSize, quantity, price });
  await newTyreStock.save();
  res.status(201).json(newTyreStock);
});

// Get All Tyre Stocks
app.get('/api/tyre-stocks', async (req, res) => {
  const tyreStocks = await TyreStock.find();
  res.status(200).json(tyreStocks);
});

// Update Tyre Stock
app.put('/api/tyre-stocks/:id', async (req, res) => {
  const { id } = req.params;
  const { quantity } = req.body;
  const updatedTyreStock = await TyreStock.findByIdAndUpdate(id, { quantity }, { new: true });
  res.status(200).json(updatedTyreStock);
});

// Delete Tyre Stock
app.delete('/api/tyre-stocks/:id', async (req, res) => {
  const { id } = req.params;
  await TyreStock.findByIdAndDelete(id);
  res.status(200).json({ message: 'Tyre stock deleted successfully' });
});


const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});