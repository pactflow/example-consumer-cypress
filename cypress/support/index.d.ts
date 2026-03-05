declare namespace Cypress {
  interface Chainable {
    mockServer(options: { consumer: string; provider: string }): void;
    addMockRoute(options: {
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
    }): void;
    verifyMockServerInteractions(): void;
    writePactsAndStopMockServers(): void;
  }
}
