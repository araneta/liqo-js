var path = require('path');

module.exports = {
  entry: [
    './src/client/index'
  ],
  output: {
    path: path.join(__dirname, './static'),
    filename: 'bundle.js'
  },
  module: {
    loaders: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        loaders: ['babel-loader']
      }
    ]
  }
};
