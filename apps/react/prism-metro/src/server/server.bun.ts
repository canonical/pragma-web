/**
 * Bun development server with SSR and streaming.
 *
 * Read the `fetch` handler top to bottom as a chain of small pieces; the
 * first that can handle the request wins:
 *
 *   1. `handleAsset`     — Vite client assets and HMR (/@vite/client, /src/**,
 *                          /@id/**, /@fs/**, /@react-refresh, /node_modules/.vite/**).
 *   2. sitemap renderer  — `/sitemap.xml` → the XML `SitemapRenderer`.
 *   3. JSX app renderer  — everything else → the HTML app.
 *
 * The two renderers know nothing about each other or about routing; this
 * server is the only thing that looks at the URL and picks one. Bun.serve()
 * is the HTTP layer, Vite runs in middleware mode for transforms and HMR, and
 * the render modules load through `vite.ssrLoadModule()` so edits are picked
 * up without a restart.
 *
 * The prepare step and the status resolver are imported natively, the route
 * table with them, while `EntryServer` loads in Vite's own module registry:
 * the data pass runs to completion before the render pass starts, and only
 * plain data, the serialised records, crosses between the two.
 */
import fs from "node:fs";
import * as process from "node:process";
import { viteFetchMiddleware } from "@canonical/react-ssr/server";
import { createServer as createViteServer } from "vite";
import { resolveGraphqlUrl } from "#relay";
import prepareRelayData from "./prepareRelayData.js";
import resolveRouteStatus from "./resolveRouteStatus.js";

const PORT = Number(process.env.PORT) || 5178;

// Resolved once, so every request prepares against the same graph.
const graphqlUrl = resolveGraphqlUrl();

const vite = await createViteServer({
  server: { middlewareMode: true },
  appType: "custom",
});

// Serve Vite's client assets and HMR; returns null for page routes.
const handleAsset = viteFetchMiddleware(vite);

Bun.serve({
  port: PORT,
  async fetch(req: Request) {
    const url = new URL(req.url);
    const requestUrl = url.pathname + url.search;

    try {
      // Vite decodes the path while serving assets, so a malformed
      // percent-encoding such as /stations/%ZZ would answer 500 with a Vite
      // stack trace; answer an honest 404 before `handleAsset` can throw.
      try {
        decodeURIComponent(url.pathname);
      } catch {
        return new Response("Not Found", { status: 404 });
      }

      const asset = await handleAsset(req);
      if (asset) return asset;

      if (url.pathname === "/sitemap.xml") {
        const { default: createSitemapRenderer } = await vite.ssrLoadModule(
          "/src/sitemap/renderer.ts",
        );
        const renderer = createSitemapRenderer();
        const stream = await renderer.renderToReadableStream(req.signal);

        return new Response(stream, {
          status: renderer.statusCode,
          headers: { "Content-Type": renderer.contentType },
        });
      }

      const template = fs.readFileSync("index.html", "utf-8");
      const html = await vite.transformIndexHtml(requestUrl, template);

      const { default: EntryServer } = await vite.ssrLoadModule(
        "/src/server/entry.tsx",
      );
      const { JSXRenderer } = await vite.ssrLoadModule(
        "@canonical/react-ssr/renderer",
      );
      const { extractPreferences } = await vite.ssrLoadModule(
        "@canonical/react-hooks",
      );

      const { theme } = extractPreferences(req.headers.get("cookie"));
      // Warm the matched route against the graph and serialise the store
      // before the renderer is constructed: the initial data is embedded
      // eagerly. `relay` is omitted on routes with nothing to prepare.
      const relay = await prepareRelayData(requestUrl, graphqlUrl);
      const renderer = new JSXRenderer(
        EntryServer,
        // The cookie is client-controlled, so only the known theme values
        // reach the document.
        {
          url: requestUrl,
          theme: theme === "light" || theme === "dark" ? theme : undefined,
          ...(relay ? { relay } : {}),
        },
        { htmlString: html, statusCode: resolveRouteStatus(requestUrl) },
      );
      const stream = await renderer.renderToReadableStream(req.signal);

      return new Response(stream, {
        status: renderer.statusCode,
        headers: { "Content-Type": renderer.contentType },
      });
    } catch (error) {
      vite.ssrFixStacktrace(error as Error);
      console.error(error);

      return new Response("Internal server error", { status: 500 });
    }
  },
});

console.log(`Bun dev server on http://localhost:${PORT}/`);
console.log(`  graph endpoint: ${graphqlUrl}`);
