const Notifications = require('../models/notifications');
const logger = require('../utils/logger');

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
          logger.error(err);
          res.status(400).json({ ok: false, err });
        });
    } else {
      const error = { ok: false, error: 'bad request' };
      logger.error(error);
      res.status(400).json(error);
    }
  },
};
