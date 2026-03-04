let serverActive = false;

interface MockServerOptions {
  consumer: string;
  provider: string;
}

interface MockRouteOptions {
  as: string;
  state: string;
  uponReceiving: string;
  withRequest: {
    method: string;
    path: string;
    headers?: Record<string, unknown>;
  };
  willRespondWith: {
    status: number;
    headers?: Record<string, string>;
    body: unknown;
  };
}

const pactDefaults = {
  cors: true,
  pactfileWriteMode: "merge",
};

export const mockServer = ({ consumer, provider }: MockServerOptions): void => {
  serverActive = true;

  if (Cypress.env("PACT_PROVIDER") as string) {
    provider = Cypress.env("PACT_PROVIDER") as string;
  }

  const pactPort = (Cypress.env("PACT_PORT") as number | undefined) ?? 1234;
  const pactDir = (Cypress.env("PACT_DIR") as string | undefined) ?? "./pacts";

  cy.log("pact: clearing out previous contracts");
  cy.task("clearPreviousPactInteractions", { dir: pactDir });

  cy.task("createMockServer", {
    ...pactDefaults,
    consumer,
    provider,
    port: pactPort,
    dir: pactDir,
  });
};

export const addMockRoute = ({
  as,
  state,
  uponReceiving,
  withRequest,
  willRespondWith,
}: MockRouteOptions): void => {
  const options = { state, uponReceiving, withRequest, willRespondWith };

  const pactPort = (Cypress.env("PACT_PORT") as number | undefined) ?? 1234;
  const pactUrl = `http://127.0.0.1:${pactPort}`;

  cy.intercept(withRequest.method, `${pactUrl}${withRequest.path}`).as(as);

  cy.task("addMockRoute", options);
};

export const verifyMockServerInteractions = (): void => {
  cy.task("verifyPacts");
};

export const writePactsAndStopMockServers = (): void => {
  cy.task("stopMockServer");
};

Cypress.Commands.add("mockServer", mockServer);
Cypress.Commands.add("addMockRoute", addMockRoute);
Cypress.Commands.add("verifyMockServerInteractions", verifyMockServerInteractions);
Cypress.Commands.add("writePactsAndStopMockServers", writePactsAndStopMockServers);

afterEach(() => {
  if (serverActive) {
    cy.log("pact: verifying mock server state");
    cy.verifyMockServerInteractions();
  }
});

after(() => {
  if (serverActive) {
    cy.log("pact: writing contract");
    cy.writePactsAndStopMockServers();
  }
});
