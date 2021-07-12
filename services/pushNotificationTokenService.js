import { findNotificationAndUpdate, findMutedChannels } from './notificationService';

const logger = require('../utils/logger')(module);

module.exports = {
  addTokenNotification: (req, res) => {
    const { body } = req;
    if (body && body.alias && body.jupId) {
      const filter = { alias: body.alias };
      const update = { token: body.token || '', jupId: body.jupId || '' };

      findNotificationAndUpdate(filter, update)
        .then(oldValue => res.json({ ok: true, oldValue }))
        .catch((error) => {
          logger.error(error);
          res.status(400).json({ ok: false, error });
        });
    } else {
      const error = {
        ok: false,
        error: 'bad request',
        message: 'Alias and JupId are required.',
      };
      logger.error(error);
      res.status(400).json(error);
    }
  },
  editMutedChannels: (req, res) => {
    const { body } = req;
    if (body && body.alias && body.channelId) {
      const filter = { alias: body.alias };
      const update = body.isMuted
        ? { $pull: { mutedChannels: body.channelId } }
        : { $push: { mutedChannels: body.channelId } };

      findNotificationAndUpdate(filter, update)
        .then(notification => res.json({ ok: true, notification }))
        .catch((error) => {
          logger.error(error);
          res.status(400).json({ ok: false, error });
        });
    } else {
      const error = {
        ok: false,
        error: 'bad request',
        message: 'Alias and Channel id are required.',
      };
      logger.error(error);
      res.status(400).json(error);
    }
  },
  findMutedChannels: (req, res) => {
    const { alias } = req.params;
    if (alias) {
      findMutedChannels(alias)
        .then(([response]) => {
          const { mutedChannels } = response || { mutedChannels: [] };
          res.json({
            ok: true,
            mutedChannels,
          });
        })
        .catch((error) => {
          logger.error(error);
          res.status(400).json({ ok: false, error });
        });
    } else {
      const error = {
        ok: false,
        error: 'bad request',
        message: 'Alias is required.',
      };
      logger.error(error);
      res.status(400).json(error);
    }
  },
};
