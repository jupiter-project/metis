const apn = require('apn');
const { APN_OPTIONS } = require('./apn');
const logger = require('../utils/logger')(module);
/**
 * Sends a push notification to devices
 * @param tokens It's a String containing the hex-encoded device token. Could be a string or array
 * @param alert Message or NotificationAlertOptions to be displayed on device
 * @param badgeCount Integer of updated badge count
 * @param payload Extra data
 * @param category Used to identify push on device
 * @param delay delay on milliseconds for push notification
 * @returns {Promise}
 */
function sendPushNotification(tokens, alert, badgeCount, payload, category, delay = 1) {
  logger.info('[Notifications][sendPushNotification] -> Start');

  const apnProvider = new apn.Provider(APN_OPTIONS);
  const notification = new apn.Notification();

  // will expire in 24 hours from now
  notification.expiry = Math.floor(Date.now() / 1000) + 24 * 3600;
  notification.badge = badgeCount;
  notification.sound = 'ping.aiff';
  notification.alert = alert;
  notification.title = payload.title;
  notification.payload = payload;
  notification.topic = 'tech.gojupiter.metis';

  notification.category = `metis.category.${category || 'default'}`;

  setTimeout(async () => {
    // Send the actual notification
    const result = await apnProvider.send(notification, tokens);
    // Show the result of the send operation:
    logger.info(JSON.stringify(result));
  }, delay);
}

module.exports = {
  sendPushNotification,
};
