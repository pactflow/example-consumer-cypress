import { defineConfig } from "cypress";
import registerPactTasks from "./cypress/support/pact-tasks";

export default defineConfig({
  allowCypressEnv: false,
  expose: {
    PACT_PORT: 1234,
    PACT_DIR: "./pacts",
    PACT_PROVIDER: process.env.PACT_PROVIDER ?? "",
  },
  e2e: {
    baseUrl: "http://localhost:3000",
    specPattern: "cypress/e2e/**/*.cy.ts",
    setupNodeEvents(on, config) {
      registerPactTasks(on, config);
      return config;
    },
  },
});
