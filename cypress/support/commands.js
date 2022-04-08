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

// Add new Pact commands to the existing Cypress interface
const pact = require("@pact-foundation/pact-web");
const axios = require("axios");
const CATCH_ALL_ROUTE = "**";
const METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE"];
const R = require("rambda");
const UNREGISTERED_INTERACTION_FAILURE_MESSAGE =
  "Please ensure you first explictly set a stub on Cypress or register a Pact interaction" +
  "\n\nIf you see this message, it means that your web page is making an HTTP call " +
  "to something not explictly registered with Pact or as a stubbed route." +
  "\n\nThis is bad, because we may miss a specific interaction of a consumer relevant to the contract " +
  "and therefore not provide safety guarantees" +
  "\n\nBecause of this, we require all HTTP interactions to be explictly configured " +
  "in your test"

const pactDefaults = {
  cors: true,
  dir: "./pacts",
  pactfileWriteMode: "merge",
};

let server = false;

export const unregisteredRouteHandler = (method, provider) => ({
  url: CATCH_ALL_ROUTE,
  method,
  status: 500,
  response: {
    message: UNREGISTERED_INTERACTION_FAILURE_MESSAGE,
  },
  onResponse: (xhr) => {
    throw new Error(`Error: unexpected interaction for '${xhr.method} ${xhr.url}' (Pact Config: Provider=${provider} BaseURL=${basePathForProvider({provider})}) \n\n${UNREGISTERED_INTERACTION_FAILURE_MESSAGE}`);
  },
});

const addCatchAllRoutes = (server) => {
  METHODS.forEach((method) => {
    cy.route(unregisteredRouteHandler(method, server));
  });
};

const findProviderInConfig = (provider) => {
  return R.find(
    R.propEq("provider", provider),
    R.propOr([], "providers", getPactConfig())
  );
};

const basePathForProvider = (server) => {
  // e.g. in this example project it will be /pacts/provider/pactflow-example-provider/consumer/pactflow-example-consumer-cypress/latest/stub as we are using Pactflow stubs
  return R.propOr("", 'baseUrl', findProviderInConfig(server.provider))
};

export const mockServer = ({ consumer, provider }) => {
  server = true;
  cy.server({});

  if (Cypress.env('PACT_PROVIDER')){
    provider = Cypress.env('PACT_PROVIDER') 
  }

  // Any route not registered should trigger a failure
  addCatchAllRoutes(provider);

  return cy.task("createMockServer", {
    ...getServerConfig(),
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
      url: `${basePathForProvider(server)}${options.withRequest.path}`,
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
  const { dir } = getServerConfig();
  cy.log(`pact: clearing previous pact files: "${dir}/*.json"`);
  cy.task("clearPreviousPactInteractions", { dir: dir });
};

export const getPactConfig = () => {
  return R.pathOr({}, ["pact"], Cypress.config());
};

export const getServerConfig = () => {
  return {
    ...pactDefaults,
    ...getPactConfig(),
  };
};

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

before(() => {
  if (server) {
    cy.log("pact: clearing out previous contracts");
    cy.clearPreviousPactInteractions();
  }
});

afterEach(() => {
  if (server) {
    cy.log("pact: verifying mock server state");
    cy.verifyMockServerInteractions();
  }
});

after(() => {
  if (server) {
    cy.log("pact: writing contract");
    cy.writePactsAndStopMockServers();
  }
});
