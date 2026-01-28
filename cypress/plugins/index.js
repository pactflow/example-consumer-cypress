/// <reference types="cypress" />
// ***********************************************************
// This example plugins/index.js can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)

// cypress/plugins/index.js
const registerPact = require('./cypress-pact')
const webpack = require('@cypress/webpack-preprocessor')

module.exports = (on, config) => {

  // Register the Pact plugin
  registerPact(on)

  // Configure webpack preprocessor to handle ES modules
  const options = {
    webpackOptions: {
      resolve: {
        extensions: ['.js', '.json']
      },
      module: {
        rules: [
          {
            test: /\.js$/,
            exclude: /node_modules\/(?!axios)/,
            use: {
              loader: 'babel-loader',
              options: {
                presets: ['@babel/preset-env']
              }
            }
          }
        ]
      }
    }
  }

  on('file:preprocessor', webpack(options))

  return on, config;
};