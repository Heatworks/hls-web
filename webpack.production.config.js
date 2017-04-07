'use strict';

var path = require('path');
var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var StatsPlugin = require('stats-webpack-plugin');
const BabiliPlugin = require("babili-webpack-plugin");

module.exports = {
    // The entry file. All your app roots fromn here.
    entry: [
        'babel-polyfill',
        path.join(__dirname, 'src/index.tsx')
    ],
    // Where you want the output to go
    output: {
        path: path.join(__dirname, '/build/'),
        filename: '[name].[hash].min.js',
        publicPath: '/'
    },
    plugins: [
        // webpack gives your modules and chunks ids to identify them. Webpack can vary the
        // distribution of the ids to get the smallest id length for often used ids with
        // this plugin
        new webpack.optimize.OccurenceOrderPlugin(),

        // handles creating an index.html file and injecting assets. necessary because assets
        // change name because the hash part changes. We want hash name changes to bust cache
        // on client browsers.
        new HtmlWebpackPlugin({
            template: 'src/index.tpl.html',
            inject: 'body',
            filename: 'index.html'
        }),
        // extracts the css from the js files and puts them on a separate .css file. this is for
        // performance and is used in prod environments. Styles load faster on their own .css
        // file as they dont have to wait for the JS to load.
        new ExtractTextPlugin('[name]-[hash].min.css'),
        // handles uglifying js
        //new BabiliPlugin({}, {}),
        
        // creates a stats.json
        new StatsPlugin('webpack.stats.json', {
            source: false,
            modules: false
        }),
        // plugin for passing in data to the js, like what NODE_ENV we are in.
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('production')
        })
    ],

    // ESLint options
    eslint: {
        configFile: '.eslintrc',
        failOnWarning: false,
        failOnError: true
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
        // Runs before loaders
        preLoaders: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'eslint'
            }
        ],
        
        // loaders handle the assets, like transforming sass to css or jsx to js.
        loaders: [
            { test: /\.tsx?$/, loaders: ['babel', 'ts-loader'] },
            {
                test: /\.json?$/,
                loader: 'json'
            },{
                test: /\.(jpe?g|png|gif|svg)$/i,
                loaders: [
                    'file-loader?hash=sha512&digest=hex&name=[hash].[ext]',
                    'image-webpack?bypassOnDebug'
                ]
            }, { 
                test: /\.css$/, 
                loader: 'style-loader!css-loader'
            }, {
                test: /\.scss$/,
                // we extract the styles into their own .css file instead of having
                // them inside the js.
                loader: ExtractTextPlugin.extract('style', 'css!postcss!sass')
            }, {
                test: /\.woff(2)?(\?[a-z0-9#=&.]+)?$/,
                loader: 'url?limit=10000&mimetype=application/font-woff'
            }, {
                test: /\.(ttf|eot|svg)(\?[a-z0-9#=&.]+)?$/,
                loader: 'file-loader'
            }
        ]
    },
    postcss: [
        require('autoprefixer')
    ]
};