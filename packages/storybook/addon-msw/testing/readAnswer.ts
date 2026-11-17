import { getResponse, type RequestHandler } from "msw";
import type { SetupWorker } from "msw/browser";

/**
 * Read the status `worker`'s handlers answer `GET path` with, or undefined
 * when none does.
 *
 * `import readAnswer from "./readAnswer.js";`
 *
 * @note Impure: runs the handlers, which moves generator resolvers on.
 */
export default async function readAnswer(
  worker: SetupWorker,
  path: string,
): Promise<number | undefined> {
  const request = new Request(new URL(path, globalThis.location.href));
  const handlers = [...worker.listHandlers()] as RequestHandler[];
  return (await getResponse(handlers, request))?.status;
}
