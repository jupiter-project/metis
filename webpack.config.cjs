/**
 *
 * @type {function(*=, *=, *=): (*)}
 *
 *  How to test the config file: npx webpack configtest ./webpack.config.cjs
 *
 */

require('core-js/stable');
require("regenerator-runtime/runtime");
// require("@babel/runtime-corejs3");
// require("@babel/runtime-corejs3/core-js-stable/promise");
const glob = require('glob');
const path = require('path');

module.exports = {
    entry: ['./src/components/text.jsx'],
    module: {
        rules: [
            {
                test: /.*\.jsx$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: 'babel-loader',
                        options: {
                            presets: [
                                [
                                    '@babel/preset-env',
                                    {
                                        targets: {
                                            edge: "17",
                                            firefox: "60",
                                            chrome: "67",
                                            safari: "11.1"
                                        },
                                        debug: true,
                                        bugfixes: true,
                                    }
                                ],
                                [   "@babel/preset-react",
                                    {
                                        runtime: "automatic"
                                    }
                                ]
                            ],
                            plugins: [
                                "@babel/plugin-proposal-function-bind",
                                "syntax-async-functions",
                                "@babel/plugin-transform-regenerator",
                            ]
                        }
                    }
                ]
            },

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
