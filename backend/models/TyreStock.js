const mongoose = require('mongoose');

const tyreStockSchema = new mongoose.Schema({
  tyreModel: { type: String, required: true },
  tyreSize: { type: String, required: true },
  quantity: { type: Number, required: true, min: 0 },
  price: { type: Number, required: true, min: 0 },
}, { timestamps: true });

module.exports = mongoose.model('TyreStock', tyreStockSchema);
