const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const package = require('./package.json');

module.exports = {
  entry: path.join(__dirname, 'src', 'App.jsx'),
  output: {
    filename: 'bundle-[hash].js',
    path: '/'
  },
  module: {
    loaders: [
      {
        test: /\.(js|jsx|es6)/,
        loader: 'babel'
      },
      {
        test: /\.css/,
        loader: 'style!css'
      },
      {
        test: /\.png/,
        loader: 'url'
      }
    ]
  },
  resolve: {
    extensions: ["", ".js", ".jsx", ".es6"]
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: package.name + '@' + package.version
    })
  ]
}