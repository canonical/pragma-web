import type { SetupWorker } from "msw/browser";

/** The preview's one start of the worker, shared by every caller. */
let starting: Promise<SetupWorker | null> | null = null;

/** The parts of a Node or Electron process that tell them apart. */
type Runtime = {
  readonly type?: unknown;
  readonly versions?: { readonly node?: string };
};

/** Whether this is a Node process, where msw/browser refuses to start. */
const isNodeProcess = (): boolean => {
  const runtime: Runtime | undefined = Reflect.get(globalThis, "process");
  return (
    Boolean(runtime?.versions?.node) &&
    runtime?.type !== "renderer" &&
    runtime?.type !== "worker"
  );
};

/**
 * Set up the worker and start it, or warn and resolve null.
 *
 * @note Impure: starts the worker; a failure clears the shared start.
 */
const startOnce = async (): Promise<SetupWorker | null> => {
  try {
    const { setupWorker } = await import("msw/browser");
    const worker = setupWorker();
    await worker.start({
      serviceWorker: { url: "./mockServiceWorker.js" },
      onUnhandledFrame: "bypass",
    });
    return worker;
  } catch (error) {
    console.warn("[MSW Addon] Failed to start the worker:", error);
    starting = null;
    return null;
  }
};

/**
 * Start the preview's one worker from `./mockServiceWorker.js`, or resolve
 * null in Node; a failed start warns, and the next call retries.
 *
 * `import startWorker from "./startWorker.js";`
 *
 * @returns The started worker, or null when none started.
 * @note Impure: starts the preview's worker once.
 */
export default function startWorker(): Promise<SetupWorker | null> {
  if (isNodeProcess()) {
    return Promise.resolve(null);
  }
  starting ??= startOnce();
  return starting;
}
