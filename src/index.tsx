import { createRoot } from "react-dom/client";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import "./index.css";
import App from "./App";
import ErrorPage from "./ErrorPage";
import ProductPage from "./ProductPage";

const container = document.getElementById("root");
if (!container) throw new Error("Root element not found");

createRoot(container).render(
  <Router>
    <Routes>
      <Route path="/error" element={<ErrorPage />} />
      <Route path="/products/:id" element={<ProductPage />} />
      <Route path="/" element={<App />} />
    </Routes>
  </Router>,
);
