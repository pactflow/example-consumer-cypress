const pact = require('@pact-foundation/pact-node');

if (process.env.CI !== 'true') {
  console.log("skipping Pact publish as not on CI...");
  process.exit(0)
}

const pactBrokerUrl = process.env.PACT_BROKER_BASE_URL;
const gitSha = process.env.TRAVIS_COMMIT;
const branch = process.env.TRAVIS_BRANCH;

// Credentials are set via environment variables
const opts = {
  pactFilesOrDirs: ['./pacts/'],
  pactBroker: pactBrokerUrl,
  tags: [branch],
  consumerVersion: gitSha
};

pact
  .publishPacts(opts)
  .catch(e => {
      console.log('Pact contract publishing failed: ', e)
  });
