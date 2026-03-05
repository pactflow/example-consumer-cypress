import { rm } from "node:fs/promises";
import {
  contentTypeFromHeaders,
  setRequestDetails,
  setResponseDetails,
} from "@pact-foundation/pact/src/v3/ffi";
import { matcherValueOrString } from "@pact-foundation/pact/src/v3/matchers";
import {
  SpecificationVersion,
  type V3Request,
  type V3Response,
} from "@pact-foundation/pact/src/v3/types";
import { makeConsumerPact } from "@pact-foundation/pact-core";
import type { ConsumerPact } from "@pact-foundation/pact-core/src/consumer/types";

type MockRouteOptions = {
  state: string;
  uponReceiving: string;
  withRequest: V3Request;
  willRespondWith: V3Response;
};

// Module-level state shared across Cypress tasks within a single test run
let consumerName: string | undefined;
let providerName: string | undefined;
let pendingInteractions: MockRouteOptions[] = [];
let activePact: ConsumerPact | undefined;
let activePort: number | undefined;

/**
 * Create a fresh ConsumerPact, apply every accumulated interaction to it, and
 * (re)start the mock server on the configured port.
 *
 * A fresh pact handle is required each time because pact-core's createMockServer
 * consumes the handle — calling newInteraction on a consumed handle causes a crash.
 */
function rebuildMockServer(pactPort: number): void {
  if (!consumerName || !providerName) {
    throw new Error("pact: rebuildMockServer called before createMockServer");
  }

  if (activePact && activePort !== undefined) {
    activePact.cleanupMockServer(activePort);
  }

  activePact = makeConsumerPact(
    consumerName,
    providerName,
    SpecificationVersion.SPECIFICATION_VERSION_V4,
    "info",
  );

  for (const opts of pendingInteractions) {
    const interaction = activePact.newInteraction("");
    interaction.uponReceiving(opts.uponReceiving);
    if (opts.state) interaction.given(opts.state);

    setRequestDetails(interaction, opts.withRequest);
    if (opts.withRequest.body !== undefined) {
      interaction.withRequestBody(
        matcherValueOrString(opts.withRequest.body),
        contentTypeFromHeaders(opts.withRequest.headers, "application/json"),
      );
    }

    setResponseDetails(interaction, opts.willRespondWith);
    if (opts.willRespondWith.body !== undefined) {
      interaction.withResponseBody(
        matcherValueOrString(opts.willRespondWith.body),
        contentTypeFromHeaders(opts.willRespondWith.headers, "application/json"),
      );
    }
  }

  activePort = activePact.createMockServer("127.0.0.1", pactPort, false);
}

export default function registerPactTasks(
  on: Cypress.PluginEvents,
  config: Cypress.PluginConfigOptions,
): void {
  const pactPort = (config.expose.PACT_PORT as number | undefined) ?? 1234;
  const pactDir = (config.expose.PACT_DIR as string | undefined) ?? "./pacts";

  console.log("registering Pact!");

  on("task", {
    createMockServer(options: { consumer: string; provider: string }) {
      consumerName = options.consumer;
      providerName = options.provider;
      pendingInteractions = [];
      activePact = undefined;
      activePort = undefined;
      return null;
    },

    addMockRoute(opts: MockRouteOptions) {
      if (!consumerName || !providerName) {
        throw new Error("pact: cannot add route, as no Pact mock service has been configured");
      }
      pendingInteractions.push(opts);
      rebuildMockServer(pactPort);
      return null;
    },

    verifyPacts() {
      if (!activePact || activePort === undefined) {
        throw new Error("pact: cannot verify pacts, as no Pact mock service has been configured");
      }
      const success = activePact.mockServerMatchedSuccessfully(activePort);
      if (!success) {
        const mismatches = activePact.mockServerMismatches(activePort);
        throw new Error(
          `Test failed for the following reasons:\n\n  ${JSON.stringify(mismatches, null, 2)}`,
        );
      }
      return true;
    },

    stopMockServer() {
      if (!activePact) {
        throw new Error("pact: cannot stop server, as no Pact mock service has been configured");
      }
      if (activePort !== undefined) {
        activePact.writePactFile(pactDir, /* merge */ true);
        activePact.cleanupMockServer(activePort);
      }
      consumerName = undefined;
      providerName = undefined;
      pendingInteractions = [];
      activePact = undefined;
      activePort = undefined;
      return true;
    },

    async clearPreviousPactInteractions({ dir }: { dir: string }) {
      try {
        await rm(dir, { recursive: true, force: true });
      } catch (e) {
        console.log("pact: error cleaning previous contract files:", e);
        throw e;
      }
      return null;
    },
  });
}
