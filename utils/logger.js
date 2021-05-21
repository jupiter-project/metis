const {
  createLogger,
  format,
  transports,
} = require('winston');
require('winston-mongodb');
require('winston-papertrail').Papertrail;

const { hasJsonStructure } = require('../utils/utils');

const winstonPapertrail = new transports.Papertrail({
  level: 'info',
  host: process.env.PAPERTRAIL_HOST,
  port: process.env.PAPERTRAIL_PORT,
});

const mongoDbTransport = new transports.MongoDB({
  level: 'error',
  db: process.env.URL_DB,
  options: {
    useUnifiedTopology: true,
  },
  collection: 'metis-logs',
  format: format.combine(format.timestamp(), format.json()),
});

const getMessageFormat = (message) => {
  return hasJsonStructure(message)
    ? JSON.stringify(message)
    : message;
};

const transportsArray = [
  new transports.File({
    level: 'error',
    maxsize: 5120000,
    maxFiles: 5,
    filename: `${__dirname}/../logs/log-api.log`,
    format: format.combine(format.timestamp(), format.json()),
  }),
  new transports.Console({
    level: 'info',
  }),
  winstonPapertrail,
];

if (process.env.NODE_ENV === 'production') {
  transportsArray.push(mongoDbTransport);
}

module.exports = createLogger({
  format: format.combine(
    format.simple(),
    format.timestamp(),
    format.printf(info => `[${info.timestamp}] ${info.level} ${getMessageFormat(info.message)}`),
  ),
  transports: transportsArray,
});
