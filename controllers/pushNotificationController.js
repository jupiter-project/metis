const Notification = require('../services/pushNotificationTokenService');

module.exports = (app) => {
  app.post('/pn_token', Notification.addTokenNotification);
  app.put('/mute_channels', Notification.editMutedChannels);
  app.get('/mute_channels/:alias', Notification.findMutedChannels);
};
