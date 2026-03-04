import axios from "axios";

export interface Product {
  id: string;
  name: string;
  type: string;
}

export class API {
  private readonly baseURL: string;

  constructor(baseUrl?: string) {
    this.baseURL = baseUrl ?? (import.meta.env.VITE_API_BASE_URL as string) ?? "";
  }

  generateAuthToken(): string {
    return `Bearer ${new Date().toISOString()}`;
  }

  async getAllProducts(): Promise<Product[]> {
    return axios
      .get<Product[]>("/products", {
        baseURL: this.baseURL,
        headers: {
          Authorization: this.generateAuthToken(),
        },
      })
      .then((r) => r.data);
  }

  async getProduct(id: string): Promise<Product> {
    return axios
      .get<Product>(`/product/${id}`, {
        baseURL: this.baseURL,
        headers: {
          Authorization: this.generateAuthToken(),
        },
      })
      .then((r) => r.data);
  }
}

export default new API(import.meta.env.VITE_API_BASE_URL as string | undefined);
