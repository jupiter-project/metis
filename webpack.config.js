var glob = require("glob");

module.exports = {
    entry: {
        js: glob.sync("./src/components/*.jsx"),
    },
    output: {
        path: __dirname + '/public/js',
        filename: 'bundle.js'
    },
    module: {
        rules: [{
            test: /\.jsx$/,
            loaders: 'babel-loader',
            exclude: /node_modules/
        }]
    },
    node: {
        fs: 'empty'
    }
}