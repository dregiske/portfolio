import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { isHomePath } from "@/lib/isHomePath";
import { checkBreakpoint } from "@/lib/breakpoint";
import "./index.css";
import App from "./App.tsx";

if (import.meta.env.DEV) checkBreakpoint();

const root = document.getElementById("root")!;
const app = (
  <StrictMode>
    <App />
  </StrictMode>
);

// The production index.html arrives with the home page already rendered into
// it (scripts/prerender.mjs), so on `/` React adopts that markup instead of
// rebuilding it. In dev, and on any 404 path, the root is empty — `index.html`
// clears the prerendered home before it can paint — so render from scratch.
if (isHomePath(window.location.pathname) && root.hasChildNodes()) {
  hydrateRoot(root, app);
} else {
  createRoot(root).render(app);
}
