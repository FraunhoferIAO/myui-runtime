const path = require('path');

module.exports = (config) => {
  config.set({
      frameworks: ['jasmine'],
      browsers: ['ChromeHeadless'],
      reporters: ['spec', 'coverage'],
      files: [
        './spec/*.js',
        { pattern: './src/*.js', watched: true, included: false, served: true }
      ],
      preprocessors: {
        './spec/*.js': ['webpack', 'sourcemap'],
        './src/*.js': ['webpack', 'sourcemap', 'coverage']
      },
      webpack: {
        resolve: {
          modules: [
            path.resolve(__dirname, "src")
          ]
        },
        module: {
          rules: [
            {
              test: /\.js?$/i,
              include: path.resolve(__dirname, "src"),
              exclude: path.resolve(__dirname, "node_modules"),
              loader: 'istanbul-instrumenter-loader',
              options: {
                esModules: true
              },
              enforce: 'post'
            }
          ]
        },
        devtool: "inline-source-map"
      },
      coverageReporter: {
        reporters: [
          { type: 'text' },
          { type: 'lcovonly' }
        ]
      },
      customLaunchers: {
        ChromeDebugging: {
          base: 'ChromeHeadless',
          flags: [ '--remote-debugging-port=9222' ]
        }
      }
  });
};