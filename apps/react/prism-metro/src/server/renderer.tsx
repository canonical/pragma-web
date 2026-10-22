import fs from "node:fs";
import type { IncomingMessage } from "node:http";
import path from "node:path";
import { extractPreferences } from "@canonical/react-hooks";
import { JSXRenderer } from "@canonical/react-ssr/renderer";
import { getRequestUrl } from "@canonical/react-ssr/server";
import { resolveGraphqlUrl } from "#relay";
import EntryServer, { type InitialData } from "./entry.js";
import prepareRelayData from "./prepareRelayData.js";
import resolveRouteStatus from "./resolveRouteStatus.js";

// The built client shell, read once at module load: it carries the hashed
// script and link tags Vite injected at build time, which the renderer
// re-emits in the streamed document.
const htmlString = fs.readFileSync(
  path.join(process.cwd(), "dist", "client", "index.html"),
  "utf-8",
);

/**
 * Read the `Cookie` header from either a Web `Request` or a Node request.
 *
 * @param request - The request as the server hands it over.
 * @returns The raw header, or `null` when there is none.
 */
function readCookieHeader(request: Request | IncomingMessage): string | null {
  return request instanceof Request
    ? request.headers.get("cookie")
    : (request.headers.cookie ?? null);
}

/**
 * The per-request factory of the compiled app renderer, the one the preview
 * server imports from `dist/server/renderer.js`. It reads the URL and the
 * cookie-backed theme off the request, runs the Relay prepare step against
 * the graph, and builds the renderer with all three in its initial data and
 * the routed document's status.
 *
 * It accepts a Web `Request` or a Node `IncomingMessage`, the two shapes a
 * server hands a renderer.
 *
 * @param request - The request to render.
 * @returns The renderer, once the prepare step has settled.
 * @note Impure: performs network requests to the graph.
 */
export default async function createAppRenderer(
  request: Request | IncomingMessage,
) {
  const url = getRequestUrl(request);
  const { theme } = extractPreferences(readCookieHeader(request));
  const relay = await prepareRelayData(url, resolveGraphqlUrl());
  // The cookie is client-controlled, so only the known theme values reach
  // the document; `relay` is omitted, not `undefined`, when nothing was
  // prepared, so the embedded JSON carries no dangling key.
  const initialData: InitialData = {
    url,
    theme: theme === "light" || theme === "dark" ? theme : undefined,
    ...(relay ? { relay } : {}),
  };
  return new JSXRenderer(EntryServer, initialData, {
    htmlString,
    statusCode: resolveRouteStatus(url),
  });
}
