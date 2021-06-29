
require('core-js/stable');
require("regenerator-runtime/runtime");
// require("@babel/runtime-corejs3");
// require("@babel/runtime-corejs3/core-js-stable/promise");
const webpack = require("webpack");
const glob = require('glob');
const path = require('path');


/**
 * Webpack configuration.
 *
 * How to test the config file: npx webpack configtest ./webpack.config.cjs
 *
 * @see
 * @param
 * @param
 * @returns
 */



module.exports = {
    entry: ['./src/components/test.jsx'],
    output: {
        path: path.resolve(__dirname, './public'),
        filename: 'bundle.js',
    },
    module: {
        rules: [
            {
                test: /.*\.jsx$/,
                exclude: /node_modules/,
                use: [{
                    loader: 'babel-loader',
                    options : {
                        presets: [
                            ['@babel/preset-env'],
                            ["@babel/preset-react", {runtime: "automatic", useBuiltIns: true, development: true}]
                        ],
                        plugins: [
                            ["@babel/plugin-transform-runtime"],
                            ["@babel/plugin-transform-regenerator"],
                        ]
                    }
                }]
            },
            {
                test: /\.(js|mjs|cjs)$/,
                include: path.resolve(__dirname),
                use: [
                    {
                        loader: 'babel-loader',
                        options: {
                            presets: [
                                ['@babel/preset-env'],
                                [ "@babel/preset-react", {runtime: "automatic", useBuiltIns: true,development: true}]
                            ],
                            plugins: [
                                ["@babel/plugin-transform-runtime"],
                                ["@babel/plugin-proposal-function-bind"],
                                ["syntax-async-functions"],
                                ["@babel/plugin-transform-regenerator"],
                            ]
                        }
                    }
                ]
            },

        ],
    },
    resolve: {
        extensions: ['.js', '.jsx', '.mjs', ".json"],
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


    devServer: {
        contentBase: path.resolve(__dirname, './public'),
    }
}
