# Cypress Pact Example

![Build](https://github.com/pactflow/example-consumer-cypress/workflows/Build/badge.svg)

[![Pact Status](https://testdemo.pactflow.io/pacts/provider/pactflow-example-provider/consumer/example-consumer-cypress/latest/badge.svg?label=provider)](https://testdemo.pactflow.io/pacts/provider/pactflow-example-provider/consumer/example-consumer-cypress/latest) (latest pact)

[![Pact Status](https://testdemo.pactflow.io/matrix/provider/pactflow-example-provider/latest/master/consumer/example-consumer-cypress/latest/master/badge.svg?label=provider)](https://testdemo.pactflow.io/pacts/provider/pactflow-example-provider/consumer/example-consumer-cypress/latest/master) (prod/prod pact)

This repository shows how Pact, Pactflow and Cypress could work together to provide increased confidence and reliability for web applications that rely on backend API communication.

The end-to-end project is based off the Pactflow CI/CD workshop at https://docs.pactflow.io/docs/workshops/ci-cd/.

It is using a public tenant on Pactflow, which you can access [here](https://testdemo.pactflow.io/) using the credentials `dXfltyFMgNOFZAxr8io9wJ37iUpY42M`/`O5AIZWxelWbLvqMd8PkAVycBJh2Psyg1`. The latest version of the Example Consumer/Example Provider pact is published [here](https://testdemo.pactflow.io/pacts/provider/pactflow-example-provider/consumer/example-consumer-cypress/latest).

_NOTE: this repository took inspiration from the great work over at https://github.com/YOU54F/cypress-pact._

[![Cypress+Pact on Youtube](https://img.youtube.com/vi/jTuuYMFJBBQ/0.jpg)](https://youtu.be/jTuuYMFJBBQ)

## CI / CD Flow:

The following is an over simplified view of how this would work in a full end-to-end workflow:

1. Cypress tests the React website running at `http://localhost:3000`.
1. Pact tests within the Cypress suite mock out network calls, generating a contract file that captures the interactions between the two systems. The contract is stored in `pacts/example-consumer-cypress-pactflow-example-provider.json` if test run was successful.
2. The contract is then published to a publicly available Pactflow account at https://testdemo.pactflow.io/pacts/provider/pactflow-example-provider/consumer/example-consumer-cypress/latest (login with username: `dXfltyFMgNOFZAxr8io9wJ37iUpY42M` / password: `O5AIZWxelWbLvqMd8PkAVycBJh2Psyg1`, example build https://github.com/pactflow/example-consumer-cypress/workflows)
3. Provider build is triggered by a webhook to validate the contract that was just published (e.g. https://github.com/pactflow/example-provider/workflows).
4. Run `can-i-deploy` to see if the Web App is compatible with the Product API and if it is safe to release to production.

## Running the project

- Run `npm i` to install cypress and related dependencies
- Start the react app: `make mocked` (this uses a stubbed backend provided by [Pactflow](https://pactflow.io/features))
- Run Cypress in GUI mode: `npm cypress:open:stubbed`
- Run Cypress in CLI mode: `npm cypress:run:stubbed`

There is also a `Makefile` to run via the CLI which is used by CI (GitHub Actions).

## Problem Statement & Use Cases

### 1. Improving the experience of Cypress testing

Running UI tests can suffer from a number of issues:

1. Flakiness - UI tests can be notoriously flakey if they are run against a real provider, due to the need to manage test data and mutations.
1. Managing test environments and test data itself can be a huge burdon on a team, resulting in reducing the size of the UI test suite to assist with maintenance.
1. Reliability - Often times to address (1) and (2), test authors will stub out endpoints to make the tests faster and more reliable

In order to combat some of the issues from above, teams may choose to fake out a backend.

The Cypress [documentation](https://docs.cypress.io/guides/guides/network-requests.html#Testing-Strategies) contains an excellent guide on the tradeoffs of stubbing vs e2e tests:

**Real Server (End to End tests issuing real network requests)**

_Real Server_:

| Pros                                             | Cons                      |
| ------------------------------------------------ | ------------------------- |
| More likely to work in production                | Requires seeding data     |
| Test coverage around server endpoints            | Much slower               |
| Great for traditional server-side HTML rendering | Harder to test edge cases |

_Stubbing_:

| Pros                                                         | Cons                                                                       |
| ------------------------------------------------------------ | -------------------------------------------------------------------------- |
| Control of response bodies, status, and headers              | No guarantee your stubbed responses match the actual data the server sends |
| Can force responses to take longer to simulate network delay | No test coverage on some server endpoints                                  |
| No code changes to your server or client code                | Not as useful if you’re using traditional server side HTML rendering       |
| Fast, < 20ms response times                                  | -                                                                          |

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

A separate solution is proposed, that makes use of the more advanced `route2` functionality, which is able to proxy all network requests. This would be useful for a broader application when a "provider driven" workflow is [implemented in Pactflow](https://github.com/pactflow/roadmap/issues/4), removing the [drawbacks](https://docs.pact.io/consumer/using_pact_to_support_ui_testing/) of this kind of contract test.
