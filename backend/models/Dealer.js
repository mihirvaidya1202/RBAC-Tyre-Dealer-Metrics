const mongoose = require('mongoose');
const User = require('./User');

if (!User.discriminators?.dealer) {
  const dealerStockSchema = new mongoose.Schema({
    tyreStockId: { type: mongoose.Schema.Types.ObjectId, ref: 'TyreStock', required: true },
    tyreModel: { type: String, required: true },
    tyreSize: { type: Number, required: true, enum: [13, 15, 17] },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
  }, { _id: false });

  const dealerSchema = new mongoose.Schema({
    dealerStock: [dealerStockSchema],
    averageRating: { type: Number, default: 0 },
    totalTyresPurchased: { type: Number, default: 0 },
  });

  User.discriminator('dealer', dealerSchema);
}

module.exports = User.discriminators.dealer;
