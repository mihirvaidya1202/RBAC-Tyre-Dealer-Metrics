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
const User = require('./models/User');

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

app.use('/api/auth', authRoutes);
app.use('/api', userRoutes);
app.use('/api/tyre-stocks', tyreStockRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/dealer', dealerRoutes);
app.use('/api/customer', customerRoutes);
console.log('Customer routes mounted at /api/customer');

const PORT = process.env.PORT || 8000;

app.get('/', (req, res) => {
  res.send('Backend server is running!');
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));