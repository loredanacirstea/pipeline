const path = require('path');

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'index.min.js',
    library: 'pipeos_types',
    libraryTarget: 'umd',
    path: path.resolve(__dirname, 'dist')
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules)/,
        use: 'babel-loader'
      }
    ]
  }
};
