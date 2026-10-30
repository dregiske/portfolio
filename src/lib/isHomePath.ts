/**
 * The site has two pages: home at `/`, and a 404 for everything else (nginx
 * falls back to index.html for unknown paths). Shared by `App`, which picks
 * the page, and `main`, which decides whether there's prerendered home markup
 * to hydrate.
 */
export function isHomePath(pathname: string) {
  return pathname === "/" || pathname === "/index.html";
}
