const mongoose = require('mongoose');
const User = require('./User');

if (!User.discriminators || !User.discriminators.Customer) {
  const customerSchema = new mongoose.Schema({
  });

  User.discriminator('Customer', customerSchema);
}

module.exports = User.discriminators.Customer;