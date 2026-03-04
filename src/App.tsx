import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "spectre.css/dist/spectre.min.css";
import "spectre.css/dist/spectre-icons.min.css";
import "spectre.css/dist/spectre-exp.min.css";
import Heading from "./Heading";
import Layout from "./Layout";
import { useNavigate } from "react-router-dom";
import API, { type Product } from "./api";

interface ProductTableRowProps {
  product: Product;
}

function ProductTableRow({ product }: ProductTableRowProps) {
  return (
    <tr>
      <td>{product.name}</td>
      <td>{product.type}</td>
      <td>
        <Link
          className="btn btn-link"
          to={`/products/${product.id}`}
          state={{ product }}
        >
          See more!
        </Link>
      </td>
    </tr>
  );
}

interface ProductTableProps {
  products: Product[];
}

function ProductTable({ products }: ProductTableProps) {
  const rows = products.map((p) => <ProductTableRow key={p.id} product={p} />);
  return (
    <table className="table table-striped table-hover">
      <thead>
        <tr>
          <th>Name</th>
          <th>Type</th>
          <th />
        </tr>
      </thead>
      <tbody>{rows}</tbody>
    </table>
  );
}

function App() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    API.getAllProducts()
      .then((r) => {
        setLoading(false);
        setProducts(r);
      })
      .catch((e: unknown) => {
        navigate("/error", { state: { error: String(e) } });
      });
  }, [navigate]);

  const visibleProducts = searchText
    ? products.filter((p) => {
        const search = searchText.toLowerCase();
        return (
          p.id.toLowerCase().includes(search) ||
          p.name.toLowerCase().includes(search) ||
          p.type.toLowerCase().includes(search)
        );
      })
    : products;

  return (
    <Layout>
      <Heading text="Products" href="/" />
      <div className="form-group col-2">
        <label className="form-label" htmlFor="input-product-search">
          Search
        </label>
        <input
          id="input-product-search"
          className="form-input"
          type="text"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
      </div>
      {loading ? (
        <div className="loading loading-lg centered" />
      ) : (
        <ProductTable products={visibleProducts} />
      )}
    </Layout>
  );
}

export default App;
