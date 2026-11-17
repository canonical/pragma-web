import type { SetupWorker } from "msw/browser";
import { defineNetwork } from "msw/experimental";

/**
 * Create a stand-in for msw's browser worker whose handler list is msw's
 * own, so `use` and `resetHandlers` follow msw's rules; `start` does
 * nothing.
 *
 * `import createWorker from "./createWorker.js";`
 */
export default function createWorker(): SetupWorker {
  const network = defineNetwork({ sources: [], handlers: [] });
  return {
    start: async () => undefined,
    use: network.use,
    resetHandlers: network.resetHandlers,
    listHandlers: network.listHandlers,
  } as unknown as SetupWorker;
}
