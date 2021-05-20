const mongoose = require('mongoose');

const notificationsSchema = new mongoose.Schema({
  alias: { type: String },
  token: { type: String },
});

module.exports = mongoose.model('Notifications', notificationsSchema);
