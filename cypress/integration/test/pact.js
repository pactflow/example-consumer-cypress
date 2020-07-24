import { Matchers } from "@pact-foundation/pact-web";
const { like, eachLike } = Matchers

const port = Math.floor(Math.random() * 49151 + 1024);

describe("Testing pact", () => {
  before(() => {
    cy.log("Test Suite Started");
    cy.startFakeServer({
      consumer: "example-cypress-consumer",
      provider: "example-provider",
      cors: true,
      port,
    });
  });

  it("adds an interaction", () => {
    const expectedProduct = {
      id: "10",
      type: "CREDIT_CARD",
      name: "28 Degrees",
    };
    cy.addInteraction({
      state: "products exist",
      uponReceiving: "a request to all products",
      withRequest: {
        method: "GET",
        path: "/products",
      },
      willRespondWith: {
        status: 200,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
        body: eachLike(expectedProduct),
      },
    });
    cy.addInteraction({
      state: "a product with ID 10 exists",
      uponReceiving: "a request to get a product",
      withRequest: {
        method: "GET",
        path: "/product/10",
      },
      willRespondWith: {
        status: 200,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
        body: eachLike(expectedProduct),
      },
    });

    // -- start duplication
    //
    // We'd like to avoid this duplication, but retain the features for Cypress users
    // TODO: we'd like this to still stub the in-browser experience, but redirect to the Pact mock service
    //       instead
    cy.server({});
    cy.route(() => {
      return {
        method: "GET",
        url: "/products",
        response: [expectedProduct],
      };
    }).as("products");
    cy.route(() => {
      return {
        method: "GET",
        url: "/product/10",
        response: expectedProduct,
      };
    }).as("product");
    // All usages of cy.request from here are also duplicates
    // -- end duplication

    // Navigate to products listing page
    cy.request(`http://localhost:${port}/products`);
    cy.visit("http://localhost:3000");
    cy.wait("@products");
    cy.wait(3000)

    // Filter to the product we want
    cy.get("#input-product-search").type("28 degrees")
    cy.wait(3000)

    // Navigate to individual product
    cy.contains("See more!").click();
    cy.wait(1000)
    cy.request(`http://localhost:${port}/product/10`);
    cy.wait("@product");

    // Assert something about product
  });
});
