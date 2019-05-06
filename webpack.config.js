const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

var isProduction = process.argv.indexOf('-p') >= 0 || process.env.NODE_ENV === 'production';

var sourcePath = path.join(__dirname, './src');
var outPath = path.join(__dirname, './build');

module.exports = {
    context: sourcePath,
    entry: {
      index: path.join(__dirname, 'src', 'index.tsx'),
    },
    resolve: {
        extensions: ['.js', '.ts', '.tsx']
    },
    output: {
      filename: '[name].bundle.js',
      path: outPath
    },
    optimization: {
      splitChunks: {
        chunks: 'all'
      }
    },
    module: {
        rules: [
            {
                test: /\.(ts|tsx)?$/,
                include: sourcePath,
                use: [
                    'ts-loader'
                ]
            },
            {
            test: /\.(gif|png|jpe?g|svg)$/i,
            use: [
              'file-loader'
            ],
          },
          // css
          {
            test: /\.css$/,
            use: [
              'style-loader',
              {
                loader: 'css-loader',
                query: {
                  modules: true,
                  sourceMap: !isProduction,
                  importLoaders: 1,
                  localIdentName: isProduction ? '[hash:base64:5]' : '[local]__[hash:base64:5]'
                }
              },
              {
                loader: 'postcss-loader',
                options: {
                  ident: 'postcss',
                  plugins: [
                    require('postcss-import')({ addDependencyTo: webpack }),
                    require('postcss-url')(),
                    require('postcss-preset-env')({
                      /* use stage 2 features (defaults) */
                      stage: 2,
                    }),
                    require('postcss-reporter')(),
                    require('postcss-browser-reporter')({
                      disabled: isProduction
                    })
                  ]
                }
              }
            ]
          },
          // static assets
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, 'src', 'index.html'),
            filename: './index.html'
        })
    ]
}