# Example Consumer

[![Build Status](https://travis-ci.com/pactflow/example-consumer.svg?branch=master)](https://travis-ci.com/pactflow/example-consumer)

This is an example of a Node consumer using Pact to create a consumer driven contract, and sharing it via [Pactflow](https://pactflow.io).

It is using a public tenant on Pactflow, which you can access [here](https://test.pact.dius.com.au) using the credentials `dXfltyFMgNOFZAxr8io9wJ37iUpY42M`/`O5AIZWxelWbLvqMd8PkAVycBJh2Psyg1`. The latest version of the Example Consumer/Example Provider pact is published [here](https://test.pact.dius.com.au/pacts/provider/pactflow-example-provider/consumer/pactflow-example-consumer/latest).

The build "pipeline" is simulated with a Makefile, and performs the following tasks:

* Run unit tests
* Run pact tests
* Publish pacts, tagging the consumer version with the name of the current branch
* Check if we are safe to deploy to prod (ie. has the pact content been successfully verified)
* Deploy
* Tag the deployed consumer version as 'prod'

## Usage

See the [Pactflow CI/CD Workshop](https://github.com/pactflow/ci-cd-workshop).
