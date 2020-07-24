# Cypress Pact Example

[![CircleCI](https://circleci.com/gh/YOU54F/cypress-pact.svg?style=svg)](https://circleci.com/gh/YOU54F/cypress-pact)

This repository intends to show how Pact, Pactflow and Cypress could work together to provide increased confidence and reliability for web applications that rely on backend API communication.

*NOTE: this repository has been forked from the great work over at https://github.com/YOU54F/cypress-pact.*

## Problem Statement & Use Cases

### 1. Improving the experience of Cypress testing
Running UI tests can suffer from a number of issues:

1. Flakiness - UI tests can be notoriously flakey if they are run against a real provider, due to the need to manage test data and mutations.
1. Managing test environments and test data itself can be a huge burdon on a team, resulting in reducing the size of the UI test suite to assist with maintenance.
1. Reliability - Often times to address (1) and (2), test authors will stub out endpoints to make the tests faster and more reliable

The Cypress [documentation]( https://docs.cypress.io/guides/guides/network-requests.html#Testing-Strategies) contains an excellent guide on the tradeoffs of stubbing vs e2e tests.

They are summarised below:

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

## Value Proposition

By integrating Pact with Cypress, there is an opportunity to reduce some of the downsides of stubbing, namely:

1. Providing guarantees that request/responses will be supported by the provider
1. Coverage of all server endpoints and interactions required by the (web) application

Additionally, we can bring in new test authors to the Pact ecosystem, and reduce duplication for teams already using both tools, thereby saving time to value and reducing maintenance costs.

## Solution Proposal

1. Create a cypress-pact plugin that natively maps over the `cy.requests` interface to create a seamless Cypress experience
1. Support "compressing" of interactions in Pactflow, to reduce the problems created by having too many examples in each contract

## Running the example

- Clone the project

### Local Installation

- Run `yarn install` to install cypress and deps
- View the `Makefile` for available commands
  - `make test-gui` run cypress in GUI mode
  - `make test` run cypress in command line mode



Implementation notes/ideas

* `cy.request` is likely an out-of-scope item here, albeit it probably is targeted at doing "pact-like" tests (e.g. their docs state "The intention of cy.request() is to be used for checking endpoints on an actual, running server without having to start the front end application.")

* Should we care about Cypress requests, servers or routes, or just expose Pact as a first class thing? What ergonomics (if any) are gained from doing it

I think `wait` ing and potentially `fixtures` could be a good argument for it: https://docs.cypress.io/guides/guides/network-requests.html#Waiting

Not integrating this might increase flakiness into the system

* Don't need to do requset assertions, because Pact will (https://docs.cypress.io/guides/guides/network-requests.html#Assertions)