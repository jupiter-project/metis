// const Notification = require('../services/pushNotificationTokenService.mjs');
import Notification from '../services/pushNotificationTokenService.mjs';

export default (app) => {
  app.post('/pn_token', Notification.addTokenNotification);
  app.put('/mute_channels', Notification.editMutedChannels);
  app.get('/mute_channels/:alias', Notification.findMutedChannels);
};
