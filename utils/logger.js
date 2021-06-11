const {
  createLogger,
  format,
  transports,
} = require('winston');
require('winston-mongodb');
const path = require('path');
//
const { hasJsonStructure } = require('../utils/utils');

const getMessageFormat = message => (hasJsonStructure(message)
  ? JSON.stringify(message)
  : message);

const getLabel = (callingModule) => {
  const parts = callingModule.filename.split(path.sep);
  return path.join(parts[parts.length - 2], parts.pop());
};
const transportList = [
  new transports.Console({
    level: 'info',
  }),
];

if (process.env.NODE_ENV === 'production') {
  transportList.push(
    new transports.MongoDB({
      level: 'error',
      db: process.env.URL_DB,
      options: {
        useUnifiedTopology: true,
      },
      collection: 'metis-logs',
      format: format.combine(format.timestamp(), format.json()),
    }),
  );
}


module.exports = function (callingModule) {
  return createLogger({
    format: format.combine(
      format.simple(),
      format.timestamp(),
      format.printf(info => `[${info.timestamp}] [${getLabel(callingModule)}] ${info.level} ${getMessageFormat(info.message)}`),
    ),
    transports: transportList,
  });
};
