const HtmlWepackPlugin = require('html-webpack-plugin');
const Path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const extractCSS = new ExtractTextPlugin('normalize.css');
const extractSASS = new ExtractTextPlugin('style.css');
module.exports = {
  entry: './src/index.js',
  mode: 'development',
  devtool: 'inline-source-map',
  module: {
    rules: [
      { test: /\.js/, exclude: /node_modules/, loader: 'babel-loader' },
      { test: /\.css$/, use: extractCSS.extract(['css-loader']) },
      {
        test: /\.scss$/,
        use: extractSASS.extract({
          fallback: 'style-loader',
          use: ['css-loader', 'sass-loader']
        })
      },
      { test: /\.(png|jpg|gif)$/, use: [{ loader: 'file-loader', options: {} }] },
      { test: /\.html$/, loader: 'html-loader' }
    ]
  },
  devServer: {
    contentBase: './dist'
  },
  plugins: [
    new HtmlWepackPlugin({ template: './src/index.html' }),
    extractCSS,
    extractSASS
  ],
  output: {
    path: Path.resolve(__dirname ,'./dist'),
    filename: 'bundle.js'
  }
};
