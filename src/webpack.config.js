
const path = require('path');
const nodeExternals = require('webpack-node-externals');

module.exports = {
  target: 'node',
  entry: './index.js',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, '..', 'dist')
  },
  externals: [nodeExternals()],
};
