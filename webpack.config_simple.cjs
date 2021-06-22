require('babel-polyfill');

const glob = require('glob');

module.exports = {
    entry: './src/components/home.jsx', // entry: ['babel-polyfill', ...glob.sync('./src/components/*.jsx')],
    output: {
        path: `${__dirname}/public/`,
        filename: 'bundle.js',
    },
    module: {
        rules: [
            {
                test: /\.jsx$/,
                use: [ {loader: 'babel-loader'}],
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        fallback: {
            fs: false
        }
    }
};

