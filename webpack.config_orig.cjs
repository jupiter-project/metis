require('babel-polyfill');

const glob = require('glob');

module.exports = {
    entry: ['babel-polyfill', ...glob.sync('./src/components/*.jsx')],
    output: {
        path: `${__dirname}/public/`,
        filename: 'bundle.js',
    },
    module: {
        rules: [
            {
                test: /\.jsx$/,
                loaders: 'babel-loader',
                exclude: /node_modules/,
            },
        ],
    },
    node: {
        fs: 'empty',
    },
};
