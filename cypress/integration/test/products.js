import { Matchers } from "@pact-foundation/pact-web";
const { like, eachLike } = Matchers;

let server;

const expectedProduct = {
  id: "10",
  type: "CREDIT_CARD",
  name: "28 Degrees",
};

describe("Product page", () => {
  describe("when products exist", () => {
    before(() => {
      cy.log("Test Suite Started");
      cy.startFakeServer({
        consumer: "example-cypress-consumer",
        provider: "example-provider",
        cors: true,
      }).then(opts => {
        cy.log('opts:', opts)
        server = opts
      })
    });

    it("can navigate to an individual product", () => {
      cy.addInteraction({
        server,
        as: 'products',
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
        server,
        as: 'product',
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
          body: like(expectedProduct),
        },
      });

      // -- start duplication
      //
      // We'd like to avoid this duplication, but retain the features for Cypress users
      // TODO: we'd like this to still stub the in-browser experience (nice dev experience not having to re-wire the app dynamically or hard coded for  tests), but redirect to the Pact mock service
      // All usages of cy.request from here are also duplicates
      // Ideally, when Pact starts, the network interface can pass-thru to the Pact mock instead of its own
      // Alternatively, we could just serialise to Pact, and ensure it validates requests?
      // -- end duplication

      // Navigate to products listing page
      cy.visit("http://localhost:3000");
      cy.wait("@products");

      // Filter to the product we want
      cy.get("#input-product-search").type("28 degrees");

      // Navigate to individual product
      cy.contains("See more!").click();
      cy.wait("@product");

      // Assert something about product
    });
  });
});
