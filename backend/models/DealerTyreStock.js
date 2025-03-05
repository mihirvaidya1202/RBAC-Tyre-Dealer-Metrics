const mongoose = require('mongoose');

const dealerTyreStockSchema = new mongoose.Schema({
  dealerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tyreId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TyreStock',
    required: true
  },
  tyreModel: {
    type: String,
    required: true
  },
  tyreSize: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  price: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

const DealerTyreStock = mongoose.model('DealerTyreStock', dealerTyreStockSchema);

module.exports = DealerTyreStock;
