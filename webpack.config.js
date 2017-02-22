'use strict';

var path = require('path');
var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var WebpackNotifierPlugin = require('webpack-notifier');


module.exports = {
    devtool: 'eval',
    entry: [
        'webpack-dev-server/client?http://localhost:3000',
        'webpack/hot/only-dev-server',
        'react-hot-loader/patch',
        'babel-polyfill',
        path.join(__dirname, 'src/index.tsx')
    ],
    output: {
        path: path.join(__dirname, '/build/'),
        filename: '[name].js',
        publicPath: '/'
    },
    plugins: [
        new HtmlWebpackPlugin({
          template: 'src/index.tpl.html',
          inject: 'body',
          filename: 'index.html'
        }),
        new webpack.optimize.OccurenceOrderPlugin(),
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoErrorsPlugin(),
        new webpack.DefinePlugin({
          'process.env.NODE_ENV': JSON.stringify('development')
        }),
        new WebpackNotifierPlugin()
    ],
    eslint: {
        configFile: '.eslintrc',
        failOnWarning: false,
        failOnError: false
    },
    optipng: {
        optimizationLevel: 7,
        interlaced: false
    },
    resolve: {
      extensions: ['', '.ts', '.tsx', '.js', '.jsx'],
      modulesDirectories: ['src', 'node_modules'],
    },
    module: {
        loaders: [
                { test: /\.tsx?$/, loaders: ['babel', 'ts-loader'] },
            {
                test: /\.json?$/,
                loader: 'json'
            },
            {
                test: /\.(jpe?g|png|gif|svg)$/i,
                loaders: [
                    'file?hash=sha512&digest=hex&name=[hash].[ext]',
                    'image-webpack?bypassOnDebug'
                ]
            },
            {
                test: /\.scss$/,
                loader: 'style!css!sass?modules&localIdentName=[name]---[local]---[hash:base64:5]'
            },
            { 
                test: /\.woff(2)?(\?[a-z0-9#=&.]+)?$/, 
                loader: 'url?limit=10000&mimetype=application/font-woff' 
            },
            { 
                test: /\.(ttf|eot|svg)(\?[a-z0-9#=&.]+)?$/, 
                loader: 'file' 
            }
        ]
    }
};