const Notifications = require('../models/notifications');

module.exports = {
  addTokenNotification: (req, res) => {
    const { body } = req;
    if (body && body.alias) {
      const filter = { alias: body.alias };
      const update = { token: body.token || '' };
      const upsertOptions = { upsert: true, new: true, runValidators: true };
      Notifications.findOneAndUpdate(filter, update, upsertOptions)
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
