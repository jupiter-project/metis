const { join } = require('path');

// TODO check environment optoins
// const IS_PRODUCTION = ['qa', 'staging', 'production'].includes(process.env.NODE_ENV);

const getApnOptions = () => {
  // const filename = IS_PRODUCTION ? 'apn.p12' : 'apn_dev.p12';
// TODO check environment optoins
//   const filename = 'production_tech.gojupiter.metis.p12';
  const certificate = 'FVF5M2K5T5.cer';
  const key = '';
  return {
    cert: join(__dirname, '../certificates', certificate),
    key: join(__dirname, '../certificates', key),
  };

  // return {
  //   pfx: join(__dirname, '../certificates', filename),
  //   passphrase: process.env.APN_PASSPHRASE,
  //   production: IS_PRODUCTION,
  // }
};

module.exports = {
  APN_OPTIONS: getApnOptions(),
  IS_PRODUCTION: false,
};
