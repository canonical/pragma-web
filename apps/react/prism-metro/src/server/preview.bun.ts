/**
 * Bun preview server: serves the compiled production artifact.
 *
 * Read the `fetch` handler top to bottom as a chain of small pieces; the
 * first that can handle the request wins:
 *
 *   1. static file      — any extension-bearing path that exists under
 *                          `dist/client` (`/robots.txt`, the hashed
 *                          `/assets/*`); extensionless routes fall through.
 *   2. sitemap renderer — `/sitemap.xml` → the XML `SitemapRenderer`.
 *   3. JSX app renderer — everything else → the HTML app.
 *
 * Both renderers are imported from the compiled `dist/server`, the same
 * bundled artifacts a production deploy ships. Run after `build:client` and
 * `build:server`; the `preview:bun` script does both. The app renderer reads
 * the graph's address from `VITE_GRAPHQL_URL` at run time.
 */
import {
  parseStaticPair,
  resolveStaticFile,
} from "@canonical/react-ssr/server";
import { resolvePort } from "#lib/site";
// The build output has no `.d.ts`; each default export matches its source
// factory, typed below from the source.
// @ts-expect-error — importing a build artifact with no declarations
import createAppRenderer from "../../dist/server/renderer.js";
// @ts-expect-error — importing a build artifact with no declarations
import createSitemapRenderer from "../../dist/server/sitemap.js";

type CreateAppRenderer = typeof import("./renderer.js").default;
type CreateSitemapRenderer = typeof import("#sitemap").createSitemapRenderer;

const PORT = resolvePort();
const staticMount = parseStaticPair(":dist/client");

Bun.serve({
  port: PORT,
  async fetch(req: Request) {
    const url = new URL(req.url);

    const filePath = resolveStaticFile(url.pathname, staticMount);
    if (filePath) {
      const file = Bun.file(filePath);
      if (await file.exists()) {
        return new Response(file);
      }
    }

    // The app renderer is async: it runs the Relay prepare step against the
    // graph before constructing the renderer.
    const renderer =
      url.pathname === "/sitemap.xml"
        ? (createSitemapRenderer as CreateSitemapRenderer)()
        : await (createAppRenderer as CreateAppRenderer)(req);
    const stream = await renderer.renderToReadableStream(req.signal);

    return new Response(stream, {
      status: renderer.statusCode,
      headers: { "Content-Type": renderer.contentType },
    });
  },
});

console.log(`Bun preview server on http://localhost:${PORT}/`);
