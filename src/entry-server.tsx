import { StrictMode } from "react";
import { renderToString } from "react-dom/server";
import { Home } from "@/pages/Home";

/**
 * Build-time only: renders the home page to HTML, which
 * `scripts/prerender.mjs` writes into `dist/index.html`. The page then paints
 * from HTML and CSS alone, before the JS arrives, and `main.tsx` hydrates it.
 *
 * Renders `Home` directly rather than `App`, which reads `window.location` —
 * there is no window here, and the prerendered file is only ever the home page.
 */
export function render() {
  return renderToString(
    <StrictMode>
      <Home />
    </StrictMode>,
  );
}
