import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles/site.css";
import "./styles/product-catalog.css";
import "./styles/official-images.css";
import "./styles/home-hero.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
