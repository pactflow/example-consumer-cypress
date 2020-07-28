// This would be externalised into a separate, importable plugin
const pact = require("@pact-foundation/pact");
const rimraf = require("rimraf");

module.exports = (on) => {
  console.log('registering Pact!')
  let server;

  on("task", {
    createMockServer(options) {
      server = new pact.Pact(options);
      return server.setup();
    },
    stopMockServer() {
      if (server) {
        return server.finalize().then(() => true)
      }
      throw new Error('pact: cannot stop server, as no Pact mock service has been configured')
    },
    addMockRoute(options) {
      return server.addInteraction(options);
    },
    verifyPacts() {
      if (server) {
        return server.verify();
      }
      throw new Error('pact: cannot verify pacts, as no Pact mock service has been configured')
    },
    clearPreviousPactInteractions({ dir }) {
      return new Promise((resolve, reject) => {
        rimraf(`${dir}/*.json`, (e) => {
          if (e) {
            console.log(
              "pact: error cleaning previous contract files:",
              e.message
            );
            reject(e);
          }
          resolve(null);
        });
      });
    },
  });
};
