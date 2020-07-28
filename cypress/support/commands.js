/* eslint-disable no-undef */
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
const axios = require("axios");
const CATCH_ALL_ROUTE = "**";
const METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE"];

const UNREGISTERED_INTERACTION_FAILURE_MESSAGE =
  "Error: unexpected interaction. Please ensure you first explictly set a stub on Cypress or register a Pact interaction";

const pactDefaults = {
  cors: true,
  dir: "./pacts",
  pactfileWriteMode: "merge"
};

export const unregisteredRouteHandler = (method) => ({
  url: CATCH_ALL_ROUTE,
  method,
  status: 500,
  response: {
    message: UNREGISTERED_INTERACTION_FAILURE_MESSAGE,
  },
  onResponse: () => {
    throw new Error(UNREGISTERED_INTERACTION_FAILURE_MESSAGE);
  },
});

const addCatchAllRoutes = () => {
  METHODS.forEach((method) => {
    cy.route(unregisteredRouteHandler(method));
  });
};

export const mockServer = ({ consumer, provider }) => {
  cy.server({});

  // Any route not registered should trigger a failure
  addCatchAllRoutes();

  return cy.task("createMockServer", {
    ...getConfig(),
    consumer,
    provider,
  });
};

export const addMockRoute = ({
  server,
  as,
  state,
  uponReceiving,
  withRequest,
  willRespondWith,
}) => {
  const options = { as, state, uponReceiving, withRequest, willRespondWith };

  cy.route(() => {
    // Store the actual request details that came in
    // and replay that to Pact later on
    let actualRequest = {
      headers: {},
      body: {},
    };
    return {
      method: options.withRequest.method,
      url: options.withRequest.path,
      response: pact.Matchers.extractPayload(options.willRespondWith.body),
      onResponse: () => {
        const config = {
          method: options.withRequest.method,
          url: `http://${server.host}:${server.port}${options.withRequest.path}`,
          ...actualRequest,
        };

        return axios.request(config);
      },

      onRequest: (xhr) => {
        // Re-send the request as seen by XHR to the pact mock service
        // important that it sends exactly what the XHR proxy does, otherwise we
        // may invalidate the contract
        actualRequest.headers = xhr.request.headers;
        actualRequest.body = xhr.request.body;
      },
    };
  }).as(options.as);

  return cy.task("addMockRoute", options);
};

export const verifyMockServerInteractions = () => {
  cy.task("verifyPacts");
};

export const writePactsAndStopMockServers = () => {
  cy.task("stopMockServer");
};

export const clearPreviousPactInteractions = () => {
  const { dir } = getConfig()
  cy.log(`pact: clearing previous pact files: "${dir}/*.json"`)
  cy.task("clearPreviousPactInteractions", {dir: dir})
}

export const getConfig = () => {
  const { pact: pactConfig} = Cypress.config();

  return {
    ...pactDefaults,
    ...pactConfig
  }
}

Cypress.Commands.add("mockServer", mockServer);
Cypress.Commands.add("addMockRoute", addMockRoute);
Cypress.Commands.add(
  "verifyMockServerInteractions",
  verifyMockServerInteractions
);
Cypress.Commands.add(
  "writePactsAndStopMockServers",
  writePactsAndStopMockServers
);

Cypress.Commands.add(
  "clearPreviousPactInteractions",
  clearPreviousPactInteractions
);
