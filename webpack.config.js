const path = require('path');
const webpack = require('webpack');
const CompressionPlugin = require('compression-webpack-plugin');
const cpoptions = { cache: true, algorithm: 'gzip' };
const ImageminPlugin = require('imagemin-webpack-plugin').default;
const CopyWebpackPlugin = require('copy-webpack-plugin');
const imageminMozjpeg = require('imagemin-mozjpeg');

const main = {
  entry: './js/main.js',
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'main.bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'babel-loader'
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  plugins: [
    new CompressionPlugin({ ...cpoptions }),
    new CopyWebpackPlugin([
      {
        from: 'img/'
      }
    ]),
    new ImageminPlugin({
      plugins: [
        imageminMozjpeg({
          quality: 50,
          progressive: true
        })
      ],
      pngquant: {
        quality: '95-100'
      },
      jpegtran: { progressive: true },
      test: /\.(jpe?g|png|gif|svg)$/i
    })
  ],
  stats: {
    colors: true
  },
  devtool: 'source-map'
};

const restaurantInfo = {
  entry: './js/restaurant_info.js',
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'restaurantInfo.bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'babel-loader'
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  stats: {
    colors: true
  },
  plugins: [
    new CompressionPlugin({ ...cpoptions }),
    new CopyWebpackPlugin([
      {
        from: 'img/'
      }
    ]),
    new ImageminPlugin({
      plugins: [
        imageminMozjpeg({
          quality: 50,
          progressive: true
        })
      ],
      pngquant: {
        quality: '95-100'
      },
      jpegtran: { progressive: true },
      test: /\.(jpe?g|png|gif|svg)$/i
    })
  ],
  devtool: 'source-map'
};

module.exports = [main, restaurantInfo];
