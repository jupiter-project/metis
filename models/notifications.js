const mongoose = require('mongoose');

const notificationsSchema = new mongoose.Schema({
  alias: String,
  jupId: String,
  token: String,
  mutedChannels: [String],
});

module.exports = mongoose.model('Notifications', notificationsSchema);
