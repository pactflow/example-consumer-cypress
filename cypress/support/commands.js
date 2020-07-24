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
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })

// add new command to the existing Cypress interface

let pactFakeServer;
export const startFakeServer = ({ consumer, provider, cors, port }) => {
  pactFakeServer = cy.task("createFakeServer", {
    consumer,
    provider,
    cors,
    port,
  });
  return pactFakeServer;
};

export const addInteraction = ({
  state,
  uponReceiving,
  withRequest,
  willRespondWith,
}) => {
  const options = { state, uponReceiving, withRequest, willRespondWith };
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
