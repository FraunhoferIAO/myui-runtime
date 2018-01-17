const path = require('path');
const webpack = require('webpack');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

const package = require('./package.json');

module.exports = {
  entry: "./src/myui-runtime.js",
  output: {
    filename: "myui-runtime.js",
    path: path.resolve(__dirname, "dist"),
    library: "myui",
    libraryTarget: "window"
  },
  resolve: {
    modules: [
      path.resolve(__dirname, "src")
    ]
  },
  devtool: "source-map",
  plugins: [
    new UglifyJsPlugin({
      sourceMap: true
    }),
    new webpack.BannerPlugin(
`${package.name} v${package.version}

Copyright (C) 2017 Fraunhofer IAO
All rights reserved.

This software may be modified and distributed under the terms
of the Clear BSD license. See the LICENSE file for details.`
    )
  ]
}