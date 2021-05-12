const Notification = require('../services/notification');

module.exports = (app) => {
  app.post('/pn_token', Notification.addTokenNotification);
};
