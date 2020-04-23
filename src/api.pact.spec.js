import path from "path";
import { Pact } from "@pact-foundation/pact";
import { API } from "./api";
import { eachLike, like } from "@pact-foundation/pact/dsl/matchers";

const mockProvider = new Pact({
  consumer: "pactflow-example-consumer",
  provider: "pactflow-example-provider",
  log: path.resolve(process.cwd(), "logs", "pact.log"),
  logLevel: "warn",
  dir: path.resolve(process.cwd(), "pacts"),
  spec: 2
});

describe("API Pact test", () => {
  beforeAll(() => {
    return mockProvider.setup();
  });

  afterEach(async () => {
    await mockProvider.verify();
  });

  afterAll(async () => {
    return mockProvider.finalize();
  });

  describe("retrieving a product", () => {
    test("ID 10 exists", async () => {
      // set up Pact interactions
      const expectedProduct = { id: "10", type: "CREDIT_CARD", name: "28 Degrees" }

      await mockProvider.addInteraction({
        state: "a product with ID 10 exists",
        uponReceiving: "a request to get a product",
        withRequest: {
          method: "GET",
          path: "/product/10",
          headers: {
            Authorization: like("Bearer 2019-01-14T11:34:18.045Z"),
          },
        },
        willRespondWith: {
          status: 200,
          headers: {
            "Content-Type": "application/json; charset=utf-8",
          },
          body: like(expectedProduct),
        },
      });

      const api = new API(mockProvider.mockService.baseUrl);

      // make request to Pact mock server
      const product = await api.getProduct("10");

      // assert that we got the expected response
      expect(product).toStrictEqual(expectedProduct);
    });

    test("product does not exist", async () => {

        // set up Pact interactions
        await mockProvider.addInteraction({
          state: 'product with ID 11 does not exist',
          uponReceiving: 'get product with ID 11',
          withRequest: {
            method: 'GET',
            path: '/product/11',
            headers: {
              "Authorization": like("Bearer 2019-01-14T11:34:18.045Z")
            }
          },
          willRespondWith: {
            status: 404
          },
        });

        const api = new API(mockProvider.mockService.baseUrl);

        // make request to Pact mock server
        await expect(api.getProduct("11")).rejects.toThrow("Request failed with status code 404");
    });
  });
});
