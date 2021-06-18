// const mongoose = require('mongoose');

import mongoose from 'mongoose';

const notificationsSchema = new mongoose.Schema({
  alias: String,
  jupId: String,
  token: String,
  mutedChannels: [String],
});

// module.exports = mongoose.model('Notifications', notificationsSchema);

export default mongoose.model('Notifications', notificationsSchema);
