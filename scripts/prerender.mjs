// Writes the server-rendered home page into dist/index.html, so the first
// paint needs only HTML and CSS. Runs after both `vite build`s (see the
// `build` script); the SSR bundle is only needed for this step and is removed.
import { readFile, rm, writeFile } from "node:fs/promises";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const ssrDir = `${root}dist-ssr`;
const indexPath = `${root}dist/index.html`;
const slot = '<div id="root"></div>';

const { render } = await import(pathToFileURL(`${ssrDir}/entry-server.js`).href);
const template = await readFile(indexPath, "utf8");
if (!template.includes(slot)) {
  throw new Error(`prerender: ${slot} not found in dist/index.html`);
}

// No whitespace inside the root: hydration would see it as a stray text node.
const html = template.replace(slot, `<div id="root">${render()}</div>`);
await writeFile(indexPath, html);
await rm(ssrDir, { recursive: true, force: true });

console.log(`prerender: wrote ${(html.length / 1024).toFixed(1)} KB to dist/index.html`);
