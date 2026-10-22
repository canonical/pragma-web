// The stylesheet comes first, before every component import below: CSS is
// emitted in the order the bundler evaluates the modules that import it, and
// the layer order a browser applies is the one it reads first.
import "../styles/index.css";
import hydrateApp from "./hydrateApp.js";

const root = document.getElementById("root");
if (!root) {
  throw new Error('Root element "#root" not found');
}

hydrateApp(root);
