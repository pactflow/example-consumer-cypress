# Cypress Pact Example

[![Build Status](https://travis-ci.com/pactflow/example-consumer-cypress.svg?branch=master)](https://travis-ci.com/pactflow/example-consumer-cypress)

This repository shows how Pact, Pactflow and Cypress could work together to provide increased confidence and reliability for web applications that rely on backend API communication.

The end-to-end project is based off the Pactflow CI/CD workshop at https://docs.pactflow.io/docs/workshops/ci-cd/. A basic understanding of how Pact works

*NOTE: this repository took inspiration from the great work over at https://github.com/YOU54F/cypress-pact.*

## CI / CD Flow:

The following is an over simplified view of how this would work in a full end-to-end workflow:

1. Cypress tests the React website running at `http://localhost:3000`.
1. Pact tests within the Cypress suite mock out network calls, generating a contract file that captures the interactions between the two systems. The contract is stored in `pacts/example-cypress-consumer-pactflow-example-provider.json` if test run was successful.
1. The contract is then published to a publicly available legacy Pactflow account at https://test.pactflow.io/pacts/provider/pactflow-example-provider/consumer/example-cypress-consumer/latest (login with username: `dXfltyFMgNOFZAxr8io9wJ37iUpY42M` / password: `O5AIZWxelWbLvqMd8PkAVycBJh2Psyg1`, example build https://travis-ci.com/github/pactflow/example-consumer-cypress)
1. Provider build is triggered by a webhook to validate the contract that was just published (e.g. https://travis-ci.com/github/pactflow/example-provider/builds/177382089).
1. Run `can-i-deploy` to see if the Web App is compatible with the Product API and if it is safe to release to production.

## Running the project

- Run `npm i` to install cypress and related dependencies
- Start the react app:  `make mocked` (this uses a stubbed backend provided by [Pactflow](https://pactflow.io/features))
- Run Cypress: `npx open cypress`

There is also a `Makefile` to run via the CLI which is used by CI (Travis).

## Problem Statement & Use Cases

### 1. Improving the experience of Cypress testing
Running UI tests can suffer from a number of issues:

1. Flakiness - UI tests can be notoriously flakey if they are run against a real provider, due to the need to manage test data and mutations.
1. Managing test environments and test data itself can be a huge burdon on a team, resulting in reducing the size of the UI test suite to assist with maintenance.
1. Reliability - Often times to address (1) and (2), test authors will stub out endpoints to make the tests faster and more reliable

In order to combat some of the issues from above, teams may choose to fake out a backend.

The Cypress [documentation]( https://docs.cypress.io/guides/guides/network-requests.html#Testing-Strategies) contains an excellent guide on the tradeoffs of stubbing vs e2e tests:

**Real Server (End to End tests issuing real network requests)**

*Benefits*:
1. More likely to work in production
1. Test coverage around server endpoints
1. Great for traditional server-side HTML rendering

*Downsides*:
1. Requires seeding data
1. Much slower
1. Harder to test edge cases

**Stubs**

*Benefits*:
1. Control of response bodies, status, and headers
1. Can force responses to take longer to simulate network delay
1. No code changes to your server or client code
1. Fast, < 20ms response times

*Downsides*:
1. No guarantee your stubbed responses match the actual data the server sends
1. No test coverage on some server endpoints
1. Not as useful if you’re using traditional server side HTML rendering

### 2. Reducing "duplication" for teams already using Pact

Pact tests are generally authored at a unit test layer, and we (currently) [discourage](https://docs.pact.io/consumer/#avoid-using-pact-for-tests-that-involve-the-ui) the use of it at the UI layer for a number of reasons. Teams using both tools could reduce the overlapping test areas and corresponding maintenance if the two tools were better integrated.

### 3. Enabling a broader audience to get the benefit from Pact

Currently, Pact tests are written as "white box" style tests, meaning they are generally authored by developers who maintain the code base. The Cypress experience is suited to a wider range of test authors who may benefit from writing and contributing to Pact tests.

### 4. Retrofitting "legacy" code bases with tests

Whilst we currently [recommend](https://docs.pact.io/consumer/#avoid-using-pact-for-tests-that-involve-the-ui) avoiding doing Pact testing through a UI test, sometimes old code bases are a bit harder to pick apart and test at the "right layer", making unit testing much more difficult. So difficult that you just don't do it. You know the kinds of problems I'm talking about. Having a Pact test run "from the outside" has significant advantages for these use cases.

## Value Proposition

By integrating Pact with Cypress, there is an opportunity to reduce some of the downsides of stubbing in Cypress, namely:

1. Providing guarantees that request/responses will be supported by the provider
1. Coverage of all server endpoints and interactions required by the (web) application

Additionally, we can bring in new test authors to the Pact ecosystem, and reduce duplication for teams already using both tools, thereby saving time to value and reducing maintenance costs.

## Solution Proposal

1. Create a `cypress-pact` plugin that natively maps over the `cy.server` and `cy.request` interfaces to create a seamless Cypress experience
1. Support "compressing" of interactions in Pactflow, to reduce the problems created by having too many examples in each contract
