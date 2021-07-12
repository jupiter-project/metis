const Notifications = require('../models/notifications');

module.exports = {
  findNotificationAndUpdate: (filter, updateData) => {
    if (!filter || !updateData) {
      throw new Error('Filter and dat to update are required.');
    }

    const upsertOptions = { upsert: true, new: true, runValidators: true };
    return Notifications.findOneAndUpdate(filter, updateData, upsertOptions);
  },
  findNotificationInfoByAliasOrJupId: (members, channelId = null) => {
    const filter = {
      $or: [
        { alias: { $in: members } },
        { jupId: { $in: members } },
      ],
      token: { $ne: '' },
    };

    if (channelId) {
      filter.mutedChannels = { $nin: [channelId] };
    }

    return Notifications.find(filter);
  },
  findMutedChannels: (alias) => {
    const filter = { alias };
    return Notifications.find(filter)
      .select('mutedChannels');
  },
};
