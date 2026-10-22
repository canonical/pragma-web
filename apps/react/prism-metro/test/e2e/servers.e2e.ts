// @vitest-environment node

/**
 * End-to-end test of the build: boot each of the four web server scripts and
 * assert it serves correctly over HTTP. The defects this guards against live
 * at the HTTP and content-type layer (assets served as text/html, a 500
 * page), so fetch-level assertions catch them, with no browser.
 *
 * Each cell runs its real package script, including the build `preview*`
 * performs, against a metro graph this suite starts. Kept out of the default
 * `test` run by the `*.e2e.ts` name; run it with `bun run test:e2e`.
 */
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { DEV_READY_MS, GRAPH_READY_MS, PREVIEW_READY_MS } from "./constants.js";
import { type RunningServer, startServer } from "./serverHarness.js";

const CWD = process.cwd();

const TEST_TIMEOUT_MS = PREVIEW_READY_MS + 30_000;

interface Cell {
  /** The package script to run. */
  readonly script: string;
  /** The readiness budget for this cell's boot, and build for preview*. */
  readonly timeoutMs: number;
  /**
   * Whether this cell server-renders. The plain `dev` and `preview` cells
   * are the Vite client-only path, so they have no `/sitemap.xml` route and
   * answer every route with the HTML shell.
   */
  readonly ssr: boolean;
}

const MATRIX: readonly Cell[] = [
  { script: "dev", timeoutMs: DEV_READY_MS, ssr: false },
  { script: "dev:bun", timeoutMs: DEV_READY_MS, ssr: true },
  { script: "preview", timeoutMs: PREVIEW_READY_MS, ssr: false },
  { script: "preview:bun", timeoutMs: PREVIEW_READY_MS, ssr: true },
];

/** A JS module must never come back as the HTML page. */
const JS_CONTENT_TYPE = /javascript/;

let graph: RunningServer;

beforeAll(async () => {
  graph = await startServer("graph", CWD, {
    timeoutMs: GRAPH_READY_MS,
    portEnv: "GRAPH_PORT",
    hostname: "127.0.0.1",
  });
});

afterAll(() => graph.stop());

describe("the server matrix serves correctly", () => {
  for (const cell of MATRIX) {
    it(
      `${cell.script} serves an HTML page and JS assets (not HTML)`,
      async () => {
        const server = await startServer(cell.script, CWD, {
          timeoutMs: cell.timeoutMs,
          env: { VITE_GRAPHQL_URL: `${graph.base}/graphql` },
        });
        try {
          // 1. The document renders.
          const page = await fetch(`${server.base}/stations`);
          expect(page.status).toBe(200);
          expect(page.headers.get("content-type")).toMatch(/text\/html/);
          const html = await page.text();
          expect(html).toContain('id="root"');

          // 2. The HTML references a client script…
          const scriptSrc = html.match(/<script[^>]+src="([^"]+)"/)?.at(1);
          expect(
            scriptSrc,
            "page should reference a client script",
          ).toBeTruthy();

          // 3. …served as JavaScript, never as the HTML page.
          const asset = await fetch(new URL(String(scriptSrc), server.base));
          expect(asset.status).toBe(200);
          expect(asset.headers.get("content-type")).toMatch(JS_CONTENT_TYPE);

          if (cell.ssr) {
            // 4. The page's own title, exactly once, inside <head>.
            const head = html.slice(0, html.indexOf("</head>"));
            expect(head.match(/<title>/g)?.length ?? 0).toBe(1);
            expect(head).toContain("<title>Stations — Metro</title>");

            // 5. /sitemap.xml comes from the sitemap renderer, as XML.
            const sitemap = await fetch(`${server.base}/sitemap.xml`);
            expect(sitemap.status).toBe(200);
            expect(sitemap.headers.get("content-type")).toMatch(/xml/);
            const xml = await sitemap.text();
            expect(xml).toContain("<urlset");
            expect(xml).toContain("/stations</loc>");
          }
        } finally {
          await server.stop();
        }
      },
      TEST_TIMEOUT_MS,
    );
  }
});
