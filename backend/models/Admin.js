const mongoose = require('mongoose');
const User = require('./User');

if (!User.discriminators || !User.discriminators.Admin) {
  const adminSchema = new mongoose.Schema({}, { _id: false });

  module.exports = User.discriminator('admin', adminSchema);
} else {
  module.exports = User.discriminators.admin;
}
