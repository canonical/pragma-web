import { createServer } from "node:http";
import type { AddressInfo } from "node:net";
import {
  createExampleHandler,
  createExampleProvider,
  GRAPHQL_PATH,
} from "@canonical/prism-graph-example";
import type { MetroGraph } from "./types.js";

/**
 * Start the metro graph on an OS-assigned loopback port: a Node HTTP server
 * that hands every request to `@canonical/prism-graph-example`'s own fetch
 * handler, so a test talks to the real provider over a real socket. Port 0
 * means it never collides with a running graph or with a parallel worker.
 *
 * @returns The running graph, once it is listening.
 * @note Impure: opens a socket and records every request it receives into
 *   the returned graph's `requests`.
 */
export default function startMetroGraph(): Promise<MetroGraph> {
  const handle = createExampleHandler(createExampleProvider());
  const requests: MetroGraph["requests"] = [];
  const server = createServer((req, res) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk: Buffer) => chunks.push(chunk));
    req.on("end", async () => {
      const method = req.method ?? "GET";
      const body = Buffer.concat(chunks).toString();
      requests.push({ method, headers: req.headers, body });
      const response = await handle(
        new Request(`http://127.0.0.1${req.url ?? GRAPHQL_PATH}`, {
          method,
          headers: { "content-type": "application/json" },
          body: method === "POST" ? body : undefined,
        }),
      );
      res.writeHead(response.status, Object.fromEntries(response.headers));
      res.end(await response.text());
    });
  });
  return new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => {
      const { port } = server.address() as AddressInfo;
      resolve({
        url: `http://127.0.0.1:${port}${GRAPHQL_PATH}`,
        requests,
        close: () =>
          new Promise<void>((closed) => {
            server.close(() => closed());
          }),
      });
    });
  });
}
