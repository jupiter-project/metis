const { S3StreamLogger } = require('s3-streamlogger');

const {
  createLogger,
  format,
  transports,
} = require('winston');
require('winston-mongodb');
const path = require('path');
const { hasJsonStructure } = require('../utils/utils');

const getS3StreamTransport = () => {
  if (
    !!process.env.S3_STREAM_ENDPOINT
    && !!process.env.S3_STREAM_KEY
    && !!process.env.S3_STREAM_SECRET_KEY
  ) {
    const bucket = process.env.NODE_ENV === 'production'
      ? process.env.S3_STREAM_BUCKET_PROD
      : process.env.S3_STREAM_BUCKET_DEV;

    const s3Stream = new S3StreamLogger({
      bucket,
      config: {
        endpoint: process.env.S3_STREAM_ENDPOINT,
      },
      access_key_id: process.env.S3_STREAM_KEY,
      secret_access_key: process.env.S3_STREAM_SECRET_KEY,
      tags: {
        type: 'errorLogs',
        project: 'Metis',
      },
      rotate_every: 3600000, // each hour (default)
      max_file_size: 5120000, // 5mb
      upload_every: 20000, // 20 seconds (default)
    });

    // AWS transport files
    return new transports.Stream({
      stream: s3Stream,
    });
  }
  return null;
};

const getMongoDBTransport = () => {
  if (process.env.URL_DB) {
    return new transports.MongoDB({
      level: 'error',
      db: process.env.URL_DB,
      options: {
        useUnifiedTopology: true,
      },
      collection: 'metis-logs',
      format: format.combine(format.timestamp(), format.json()),
    });
  }
  return null;
};

const getMessageFormat = message => (hasJsonStructure(message)
  ? JSON.stringify(message)
  : message);

const getLabel = (callingModule) => {
  const parts = callingModule.filename.split(path.sep);
  return path.join(parts[parts.length - 2], parts.pop());
};


// Console logs transport
const consoleTransport = new transports.Console({
  level: 'info',
});

// Mongo DB transport
const mongoDbTransport = getMongoDBTransport();

const s3Transport = getS3StreamTransport();

// Transport list Array
const transportList = [
  consoleTransport,
];

if (s3Transport) {
  transportList.push(s3Transport);
}

if (mongoDbTransport && process.env.NODE_ENV === 'production') {
  transportList.push(mongoDbTransport);
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
