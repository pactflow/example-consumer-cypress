// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//

// add new command to the existing Cypress interface
const pact = require("@pact-foundation/pact-web");
const axios = require('axios');

export const startFakeServer = ({ consumer, provider, cors, port }) => {
  cy.server({});
  return cy.task("createFakeServer", {
    consumer,
    provider,
    cors,
    port,
  })
};

export const addInteraction = ({
  server,
  as,
  state,
  uponReceiving,
  withRequest,
  willRespondWith,
}) => {
  const options = { as, state, uponReceiving, withRequest, willRespondWith };
  cy.log(Cypress.config("pact"))
  cy.route(() => {
    // Store the actual request details
    let actualRequest = {
      headers: {},
      body: {},
    }
    return {
      method: options.withRequest.method,
      url: options.withRequest.path,
      response: pact.Matchers.extractPayload(options.willRespondWith.body),
      onResponse: () => {
        const config = {
          method: options.withRequest.method,
          url: `http://${server.host}:${server.port}${options.withRequest.path}`,
          ...actualRequest
        }

        axios.request(config)
      },

      onRequest: (xhr) => {
        // Re-send the request as seen by XHR to the pact mock service
        // important that it sends exactly what the XHR proxy does, otherwise we
        // may invalidate the contract
        actualRequest.headers = xhr.request.headers
        actualRequest.body = xhr.request.body
      }
    };
  }).as(options.as);

  return cy.task("addInteraction", options);
};

export const verifyAndResetAllFakeServers = () => {
  cy.task("verifyPacts");
};

export const writePactsAndStopAllFakeServers = () => {
  cy.task("stopFakeServer");
};

Cypress.Commands.add("startFakeServer", startFakeServer);
Cypress.Commands.add("addInteraction", addInteraction);
Cypress.Commands.add(
  "verifyAndResetAllFakeServers",
  verifyAndResetAllFakeServers
);
Cypress.Commands.add(
  "writePactsAndStopAllFakeServers",
  writePactsAndStopAllFakeServers
);
