const mongoose = require('mongoose');
const User = require('./User');

if (!User.discriminators?.customer) {
  const orderHistorySchema = new mongoose.Schema({
    tyreId: { type: mongoose.Schema.Types.ObjectId, ref: 'TyreStock', required: true },
    dealerId: { type: mongoose.Schema.Types.ObjectId, ref: 'dealer', required: true }, 
    quantity: { type: Number, required: true },
    purchaseDate: { type: Date, default: Date.now },
  }, { _id: false });

  const customerSchema = new mongoose.Schema({
    orderHistory: [orderHistorySchema],
  });

  User.discriminator('customer', customerSchema);
}

module.exports = User.discriminators.customer;