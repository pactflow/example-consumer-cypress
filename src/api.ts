import axios from "axios";

export interface Product {
  id: string;
  name: string;
  type: string;
}

export class API {
  private readonly baseURL: string;

  constructor(url?: string) {
    if (!url) {
      url = import.meta.env.VITE_API_BASE_URL as string;
    }
    if (url.endsWith("/")) {
      url = url.slice(0, url.length - 1);
    }
    this.url = url;
  }

  withPath(path: string): string {
    if (!path.startsWith("/")) {
      path = "/" + path;
    }
    return `${this.url}${path}`;
  }

  generateAuthToken(): string {
    return "Bearer " + new Date().toISOString();
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
      .get<Product>(this.withPath("/product/" + id), {
        headers: {
          Authorization: this.generateAuthToken(),
        },
      })
      .then((r) => r.data);
  }
}

export default new API(import.meta.env.VITE_API_BASE_URL as string | undefined);
