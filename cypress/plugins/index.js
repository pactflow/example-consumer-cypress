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

const pact = require("@pact-foundation/pact");
const rimraf = require("rimraf");

module.exports = (on, config) => {
  let server;

  on("task", {
    createMockServer(options) {
      server = new pact.Pact(options);
      return server.setup();
    },
    stopMockServer() {
      if (server) {
        server.finalize();
      }
      return null;
    },
    addMockRoute(options) {
      return server.addInteraction(options);
    },
    verifyPacts() {
      return server.verify();
    },
    clearPreviousPactInteractions({dir}) {
      return new Promise((resolve, reject) => {
        rimraf(`${dir}/*.json`, (e) => {
          if (e) {
            console.log("pact: error cleaning previous contract files:", e.message)
            reject(e)
          }
          resolve(null)
        })
      })
    }
  });

  return on, config;
};