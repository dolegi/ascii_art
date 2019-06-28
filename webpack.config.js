const webpack = require('webpack');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer')
  .BundleAnalyzerPlugin;
const HTMLWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
  mode: 'development',
  devtool: 'source-map',
  devServer: {
    contentBase: './dist'
  },
  output: {},

  resolve: {
    // options for resolving module requests
    mainFields: ['module', 'main', 'browser']
  },

  optimization: {
    minimizer: [new UglifyJsPlugin()]
  },

  plugins: [
    new HTMLWebpackPlugin({
      template: 'src/index.html'
    }),
    new BundleAnalyzerPlugin(),
    new webpack.DefinePlugin({
      'process.env.ENVIRONMENT': "'BROWSER'"
    })
  ],

  node: {
    fs: 'empty'
  },

  devServer: {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods':
      'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers':
      'X-Requested-With, content-type, Authorization'
    }
  }
};
