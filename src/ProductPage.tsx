import React, { useState, useEffect } from "react";
import "spectre.css/dist/spectre.min.css";
import "spectre.css/dist/spectre-icons.min.css";
import "spectre.css/dist/spectre-exp.min.css";
import Layout from "./Layout";
import Heading from "./Heading";
import { useParams, useNavigate } from "react-router-dom";
import API, { type Product } from "./api";

function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<Product | null>(null);

  useEffect(() => {
    if (!id) return;
    API.getProduct(id)
      .then((r) => {
        setLoading(false);
        setProduct(r);
      })
      .catch((e: unknown) => {
        console.error("failed to load product " + id, e);
        navigate("/error", {
          state: { error: String(e) },
        });
      });
  }, [id, navigate]);

  const productInfo = product ? (
    <div>
      <p>ID: {product.id}</p>
      <p>Name: {product.name}</p>
      <p>Type: {product.type}</p>
    </div>
  ) : null;

  return (
    <Layout>
      <Heading text="Products" href="/" />
      {loading ? (
        <div
          style={{
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          className="loading loading-lg"
        />
      ) : (
        productInfo
      )}
    </Layout>
  );
}

export default ProductPage;
