/**
 *
 * @type {function(*=, *=, *=): (*)}
 *
 *  How to test the config file: npx webpack configtest ./webpack.config.cjs
 *
 */
// require('babel-polyfill');
// import "core-js/stable";
require('core-js/stable');
require("regenerator-runtime/runtime");
// require("@babel/runtime-corejs3");
// require("@babel/runtime-corejs3/core-js-stable/promise");
const glob = require('glob');
const path = require('path');

module.exports = {
    entry: [...glob.sync('./src/components/*.jsx')],
    node: {
        fs: 'empty'
    },
    module: {
        rules: [
            {test: /.*\.mjs/, type: "javascript/auto"},
            {test: /.*\.cjs/, type: "javascript/auto"},
            {
                test: /.*\.jsx$/,
                exclude: /node_modules/,
                use: [{loader: 'babel-loader'}]
            },
            {
                test: /.*\.jsx_s$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: 'babel-loader',
                        options: {
                            presets: [
                                [
                                    '@babel/preset-env',
                                    {
                                        corejs: false // debug: true,  // modules: false, useBuiltIns: 'usage',  //bugfixes: true,
                                    }
                                ],
                                [   "@babel/preset-react", { //runtime: "automatic"
                                }
                                ]
                            ],
                            plugins: [
                                "@babel/plugin-proposal-function-bind",
                                "syntax-async-functions", // "@babel/plugin-transform-regenerator", //"syntax-async-functions",
                                // ['@babel/plugin-transform-runtime',  { version: "7.0.0"  //useESModules: true    regenerator: true, //corejs: {version: 3, proposals: true}, // absoluteRuntime: true, helpers: true,}]
                            ]
                        }
                    }
                ]
            },
            {
                test: /.*\.js$/,
                type: 'javascript/auto',
                exclude: /node_modules/,
                use: [
                    {
                        loader: 'babel-loader',
                        options: {
                            presets: [
                                [
                                    '@babel/preset-env',
                                    {
                                        debug: true,  //modules: false,
                                        useBuiltIns: 'usage',
                                        bugfixes: true,
                                        corejs: 3
                                    }
                                ],
                                [   "@babel/preset-react", {
                                    runtime: "automatic"
                                }
                                ]
                            ],
                            plugins: [
                                "syntax-async-functions",
                                "@babel/plugin-proposal-function-bind",
                                "@babel/plugin-transform-regenerator",
                                [
                                    '@babel/plugin-transform-runtime',
                                    {
                                        helpers: true,
                                        corejs: 3, // absoluteRuntime: true,
                                        regenerator: true,
                                        version: "7.0.0", // useESModules: true
                                    }
                                ]
                            ]
                        }
                    }
                ]

            }
        ],
    },
    resolve:
        {
        extensions: ['*', '.js', '.jsx'],
        modules: [
            path.resolve(__dirname, "node_modules")
        ],
        fallback: {
            fs: false,

            "stream": require.resolve("stream-browserify"), //"crypto": require.resolve("crypto-browserify"),
            "zlib": require.resolve("browserify-zlib"),
            "_stream_transform": false
        },
        alias: {
            config: path.resolve(__dirname, 'config.js')
        }
    },
    output: {
        path: path.resolve(__dirname, './public'),
        filename: 'bundle.js',
    },
    devServer: {
        contentBase: path.resolve(__dirname, './public'),
    }
}
