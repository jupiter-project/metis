const Notification = require('../services/notification');

module.exports = (app) => {
  app.get('/pn_token', Notification.getNotifications);

  app.post('/pn_token', Notification.addTokenNotification);
};
