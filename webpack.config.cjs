// require('babel-polyfill');
// import "core-js/stable";
require('core-js/stable');
require("regenerator-runtime/runtime");

const glob = require('glob');
const path = require('path');

module.exports = {
  entry: [...glob.sync('./src/components/*.jsx')],

  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: ['babel-loader']
      }
    ],
  },
  resolve: {
      fallback: {
        fs: false,
        "crypto": require.resolve("crypto-browserify"),
        "stream": require.resolve("stream-browserify"),
        "zlib": require.resolve("browserify-zlib"),
        "_stream_transform": false
      },
  },
  output: {
    path: path.resolve(__dirname, './public'),
    filename: 'bundle.js',
  },
  devServer: {
    contentBase: path.resolve(__dirname, './public'),
  }
};

// Utilities: path.resolve(__dirname, 'src/utilities/'),

