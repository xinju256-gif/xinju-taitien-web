import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { migrateLegacyRoute, normalizePath } from "./context/RouterContext";
import App from "./App";
import "./styles/site.css";
import "./styles/product-catalog.css";
import "./styles/official-images.css";
import "./styles/home-hero.css";

const legacy = migrateLegacyRoute();
const root = document.getElementById("root")!;
const app = (
  <StrictMode>
    <App initialPath={normalizePath(location.pathname)} />
  </StrictMode>
);
// Legacy URLs can request a different page from the HTML returned by the server.
if (root.hasChildNodes() && !legacy) hydrateRoot(root, app);
else createRoot(root).render(app);
