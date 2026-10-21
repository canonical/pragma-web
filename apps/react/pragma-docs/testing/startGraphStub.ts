import { createServer } from "node:http";
import type { AddressInfo } from "node:net";
import type { GraphStub } from "./types.js";

/**
 * Start a stub graph server on an OS-assigned loopback port.
 *
 * It records every request and answers each with the response registered
 * under the request's `operationName`, or with a GraphQL error when none
 * is: the request is still recorded, which is what a case that only counts
 * requests asserts. Port 0 means the stub never collides with a real graph
 * server or with a parallel test worker.
 *
 * @param responses - The JSON bodies to answer with, by operation name.
 * @returns The running stub, once it is listening.
 * @note Impure: opens a socket and records into the returned stub's
 *   `captured` log.
 */
export default function startGraphStub(
  responses: Readonly<Record<string, unknown>>,
): Promise<GraphStub> {
  const captured: GraphStub["captured"] = [];
  const server = createServer((req, res) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk: Buffer) => chunks.push(chunk));
    req.on("end", () => {
      const body = JSON.parse(Buffer.concat(chunks).toString()) as Record<
        string,
        unknown
      >;
      captured.push({
        method: req.method ?? "",
        url: req.url ?? "",
        headers: req.headers,
        body,
      });
      res.writeHead(200, { "content-type": "application/json" });
      res.end(
        JSON.stringify(
          responses[String(body.operationName)] ?? {
            errors: [{ message: "stub: request recorded, not answered" }],
          },
        ),
      );
    });
  });
  return new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => {
      const { port } = server.address() as AddressInfo;
      resolve({
        url: `http://127.0.0.1:${port}/graphql`,
        captured,
        close: () =>
          new Promise<void>((closed) => {
            server.close(() => closed());
          }),
      });
    });
  });
}
