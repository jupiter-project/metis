// require('babel-polyfill');

const glob = require('glob');

module.exports = {
  entry: [...glob.sync('./src/components/*.jsx')],
  output: {
    path: `${__dirname}/public/`,
    filename: 'bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.jsx$/,
        loader: 'babel-loader',
        exclude: /node_modules/
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
    }
};


// Utilities: path.resolve(__dirname, 'src/utilities/'),
