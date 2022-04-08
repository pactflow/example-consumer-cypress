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
      cy.mockServer({
        consumer: "pactflow-example-consumer-cypress",
        provider: 'pactflow-example-provider',
      }).then(opts => {
        server = opts
      })
    });

    it("can navigate to an individual product", () => {
      cy.addMockRoute({
        server,
        as: 'products',
        state: "products exist",
        uponReceiving: "a request to all products",
        withRequest: {
          method: "GET",
          path: "/products",
          headers: {
            'Authorization': like('Bearer 2019-01-14T11:34:18.045Z')
          }
        },
        willRespondWith: {
          status: 200,
          headers: {
            "Content-Type": "application/json; charset=utf-8",
          },
          body: eachLike(expectedProduct),
        },
      });
      cy.addMockRoute({
        server,
        as: 'product',
        state: "a product with ID 10 exists",
        uponReceiving: "a request to get a product",
        withRequest: {
          method: "GET",
          path: "/product/10",
          headers: {
            'Authorization': like('Bearer 2019-01-14T11:34:18.045Z')
          }
        },
        willRespondWith: {
          status: 200,
          headers: {
            "Content-Type": "application/json; charset=utf-8",
          },
          body: like(expectedProduct),
        },
      });

      // Navigate to products listing page
      cy.visit("http://localhost:3000");
      cy.wait("@products");

      // Filter to the product we want
      cy.get("#input-product-search").type("28 degrees");

      // Navigate to individual product
      cy.contains("See more!").click();
      cy.wait("@product");

      // ... Assert something about product page
    });
  });
});
