const Notifications = require('../models/notifications');

module.exports = {
  getNotifications: (req, res) => {
  },
  addTokenNotification: (req, res) => {
    const { body } = req;

    if (body?.alias && body?.token) {
      const notifications = new Notifications(body);

      notifications.save()
        .then((newNotification) => {
          res.json({ ok: true, newNotification });
        })
        .catch((err) => {
          res.status(400).json({ ok: false, err });
        });
    } else {
      res.status(400).json({ ok: false, error: 'bad request' });
    }
  },
};
