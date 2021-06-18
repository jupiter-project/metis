const {
  createLogger,
  format,
  transports,
} = require('winston');

require('winston-mongodb');

const path = require('path');

const { hasJsonStructure } = require('../utils/utils');

const config = require('../config.js');

console.log(config.mongo.url);

const mongoDbTransport = new transports.MongoDB({
  level: 'error',
  db: config.mongo.url,
  options: {
    useUnifiedTopology: true,
  },
  collection: 'metis-logs',
  format: format.combine(format.timestamp(), format.json()),
});


const transportsArray = [
  new transports.File({
    level: 'error',
    maxsize: 5120000,
    maxFiles: 5,
    filename: config.logFilePath,
  }),
  new transports.Console({
    level: 'info',
  }),
];

const getMessageFormat = message => (hasJsonStructure(message)
  ? JSON.stringify(message)
  : message);

const getLabel = (callingModule) => {

  return '--getLabel--'
  // const parts = callingModule.filename.split(path.sep);
  // return path.join(parts[parts.length - 2], parts.pop());
};

if (config.isProduction) {
  transportsArray.push(mongoDbTransport);
}

module.exports = function (callingModule) {
  return createLogger({
    format: format.combine(
      format.simple(),
      format.timestamp(),
      format.printf(info => `[${info.timestamp}] [${getLabel(callingModule)}] ${info.level} ${getMessageFormat(info.message)}`),
    ),
    transports: transportsArray,
  });
};
