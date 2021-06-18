const { join } = require('path');
const { isProduction, apnPassPhrase } = require('../config');

const getApnOptions = () => ({
  pfx: join(__dirname, '../certificates', 'apn.p12'),
  passphrase: apnPassPhrase,
  production: isProduction,
});

module.exports = {
  APN_OPTIONS: getApnOptions(),
  isProduction,
};
