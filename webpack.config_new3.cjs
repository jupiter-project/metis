
require('core-js/stable');
require("regenerator-runtime/runtime");
require('babel-polyfill');
// require("@babel/runtime-corejs3");
// require("@babel/runtime-corejs3/core-js-stable/promise");
// const webpack = require("webpack");
// const path = require("path");
const NodePolyfillPlugin = require("node-polyfill-webpack-plugin")
const HtmlWebpackPlugin = require("html-webpack-plugin");
const glob = require('glob');
const path = require('path');


/**
 * Webpack configuration.
 *
 * How to test the config file: npx webpack configtest ./webpack.config.cjs
 *
 *
 * ...glob.sync('./src/components/*.jsx')
 *
 *
 * plugins: [
 new NodePolyfillPlugin(),
 new HtmlWebpackPlugin(),
 "@babel/plugin-proposal-class-properties"


 "@babel/plugin-proposal-function-bind",
 "@babel/plugin-proposal-class-properties",
 "syntax-async-functions",

 plugins: [
 new NodePolyfillPlugin()
 ],


 ]
 *
 * @see
 * @param
 * @param
 * @returns
 */


module.exports = {
    entry: {
        main: ['./controllers/_application.js'],
    },
    output: {
        path: path.resolve(__dirname, './public'),
        filename: 'bundle.js',
    },
    mode: 'development',

    module: {
        rules: [
            {
                test: /.jsx?$/,
                exclude: /node_modules/,
                use: [{
                    loader: 'babel-loader',

                    options : {
                        presets: [
                            ['@babel/preset-env', {"useBuiltIns": "entry"}],
                            ["@babel/preset-react", {runtime: "automatic", useBuiltIns: true, development: true}],

                        ],
                        plugins: [
                            "@babel/plugin-transform-runtime",
                            "@babel/plugin-transform-regenerator",
                        ]
                    }
                }]
            },
            {
                test: /\.(js|mjs|cjs)$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: 'babel-loader',

                        options: {
                            presets: [
                                ['@babel/preset-env', {"useBuiltIns": "entry"}],
                                [ "@babel/preset-react", {runtime: "automatic", useBuiltIns: true,development: true}]
                            ],
                            plugins: [
                                "@babel/plugin-transform-runtime",
                                "@babel/plugin-transform-regenerator",
                            ]
                        }
                    }
                ]
            },

        ],
    },
    resolve: {
        extensions: ['.js', '.jsx', '.mjs', ".json", ".cjs"],
        modules: [path.resolve(__dirname, "node_modules"), "node_modules"],
        fallback: {
            "babel-types": false,
            "mongodb-client-encryption": false,
            "dns": false,
            "aws4": false,
            "os": false,
            "fs": false,
            "tls": false,
            "net": false,
            "path": false,
            "zlib": false,
            "http": false,
            "https": false,
            "stream": false,
            "crypto": false,
            "crypto-browserify": require.resolve('crypto-browserify'), //if you want to use this module also don't forget npm i crypto-browserify

        },
        alias: {
            config: path.resolve(__dirname, 'config.js')
        }
    },
    devServer: {
        contentBase: path.resolve(__dirname, './public'),
    },

}
