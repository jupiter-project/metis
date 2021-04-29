// const apn = require('apn');
// const { APN_OPTIONS } = require('../config/notifications');
//
// module.exports = {
//   /**
//    * Sends a push notification to devices
//    * @param tokens A "token" is a String containing the hex-encoded device token.
//    * Could be a string or [string]
//    * @param alert Message or NotificationAlertOptions to be displayed on device
//    * @param badgeCount Integer of updated badge count
//    * @param payload Extra data
//    * @param category Used to identify push on device
//    * @returns {Promise}
//    */
//   sendPushNotification: (tokens, alert, badgeCount, payload, docategory) => new Promise((resolve) => {
//     console.log('[Util][sendPushNotification] -> Start');
//
//     const apnProvider = new apn.Provider(APN_OPTIONS);
//     const notification = new apn.Notification();
//     notification.expiry = Math.floor(Date.now() / 1000) + 24 * 3600; // will expire in 24 hours from now
//     notification.badge = badgeCount;
//     notification.sound = 'ping.aiff';
//     notification.alert = alert;
//     notification.title = payload.title;
//     notification.payload = payload;
//     notification.topic = 'tech.gojupiter.metis';
//
//     notification.category = `gojupiter.category.${category || 'default'}`;
//
//     // Send the actual notification
//     apnProvider.send(notification, tokens).then((result) => {
//       // Show the result of the send operation:
//       console.log(JSON.stringify(result));
//       resolve(result);
//     });
//   }),
// };
