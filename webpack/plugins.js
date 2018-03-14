const webpack = require('webpack')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const ManifestPlugin = require('webpack-manifest-plugin')
const PATHS = require('./paths')

module.exports = ({ production = false, browser = false } = {}) => {
  const bannerOptions = { raw: true, banner: 'require("source-map-support").install();' }
  const compress = { warnings: false }
  const compileTimeConstantForMinification = { __PRODUCTION__: JSON.stringify(production) }

  if (!production && !browser) {
    return [
      // Use Infinity to prevent code-split on the server
      new webpack.optimize.MinChunkSizePlugin({minChunkSize: Infinity}),
      new webpack.EnvironmentPlugin(['NODE_ENV']),
      new webpack.DefinePlugin(compileTimeConstantForMinification),
      new webpack.BannerPlugin(bannerOptions)
    ]
  }
  if (!production && browser) {
    return [
      // create a common chunk in the vendor entry, and
      // put the webpackjsonp manifest in a common chunk
      // this makes sure that chunks hashes doesn't change too often
      new webpack.optimize.CommonsChunkPlugin({
        path: PATHS.assets,
        names: ['vendor', 'common'],
        filename: '[name].js',
        minChuncks: Infinity
      }),
      new webpack.optimize.MinChunkSizePlugin({minChunkSize: 10000}),
      new webpack.EnvironmentPlugin(['NODE_ENV']),
      new webpack.DefinePlugin(compileTimeConstantForMinification),
      new webpack.HotModuleReplacementPlugin(),
      new webpack.NoEmitOnErrorsPlugin()
    ]
  }
  if (production && !browser) {
    return [
      // Use Infinity to prevent code-split on the server
      new webpack.optimize.MinChunkSizePlugin({minChunkSize: Infinity}),
      new webpack.EnvironmentPlugin(['NODE_ENV']),
      new webpack.DefinePlugin(compileTimeConstantForMinification),
      new webpack.BannerPlugin(bannerOptions),
      new webpack.optimize.UglifyJsPlugin({ compress })
    ]
  }
  if (production && browser) {
    return [
      new ManifestPlugin({
        fileName: 'app-manifest.json',
        stripSrc: true
      }),

      // create a common chunk in the vendor entry, and
      // put the webpackjsonp manifest in a common chunk
      // this makes sure that chunks hashes doesn't change too often
      new webpack.optimize.CommonsChunkPlugin({
        path: PATHS.assets,
        names: ['vendor', 'common'],
        filename: '[name].[chunkhash].chunk.js',
        minChuncks: Infinity
      }),
      new webpack.optimize.MinChunkSizePlugin({minChunkSize: 10000}),
      new webpack.EnvironmentPlugin(['NODE_ENV']),
      new webpack.DefinePlugin(compileTimeConstantForMinification),
      new ExtractTextPlugin({
        filename: '[contenthash].css',
        allChunks: true
      }),
      new webpack.optimize.UglifyJsPlugin({ compress }),
      new webpack.optimize.ModuleConcatenationPlugin(),
      new ManifestPlugin({
        fileName: 'manifest.json'
      })
    ]
  }
  return []
}
