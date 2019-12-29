const path = require('path');

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'dtype-controls.min.js',
    library: 'dtype-controls',
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
