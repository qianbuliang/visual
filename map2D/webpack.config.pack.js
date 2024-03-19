var path = require('path');

module.exports = {
  mode: 'production',
  entry: './src/map2D',
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: 'map2D.js',
    libraryTarget: 'commonjs2'
  },
  module: {
    rules: [
      {test: /\.js$/, loader: 'babel-loader', exclude: /node_modules/}
    ]
  }
}