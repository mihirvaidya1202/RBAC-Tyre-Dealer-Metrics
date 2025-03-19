const mongoose = require('mongoose');

const tyreStockSchema = new mongoose.Schema({
    tyreModel: { type: String, required: true },
    tyreSize: { type: String, required: true, enum: [13, 15, 17] },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    dealerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
    averageRating: { type: Number, default: 0 },
  }, { timestamps: true });  

module.exports = mongoose.model('TyreStock', tyreStockSchema);