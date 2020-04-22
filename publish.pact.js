require('dotenv').config()
const pact = require('@pact-foundation/pact-node');

if (process.env.CI !== 'true') {
  console.log("skipping Pact publish as not on CI...");
  process.exit(0)
}

// Credentials are set via environment variables
const opts = {
  pactFilesOrDirs: ['./pacts/'],
  pactBroker: process.env.PACT_BROKER_BASE_URL,
  consumerVersion: process.env.TRAVIS_COMMIT,
  tags: [process.env.TRAVIS_BRANCH]
};

pact
  .publishPacts(opts)
  .catch(e => {
      console.log('Pact contract publishing failed: ', e)
  });
