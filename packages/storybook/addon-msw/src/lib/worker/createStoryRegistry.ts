import type { RequestHandler } from "msw";
import type { SetupWorker } from "msw/browser";
import type {
  BeforeEach,
  LoaderFunction,
  Renderer,
} from "storybook/internal/types";
import { KEY, PARAM_KEY } from "../../constants.js";
import type { MswParameter } from "../../types.js";
import startWorker from "./startWorker.js";

/** The annotations that serve the shown stories' handlers. */
type StoryRegistry = {
  /**
   * A project loader serving the story beside every other shown story,
   * withdrawing it if its render is aborted before its beforeEach.
   *
   * @note Impure: registers the story and changes the worker's handlers.
   */
  readonly serveStory: LoaderFunction<Renderer>;
  /**
   * A beforeEach whose cleanup withdraws the story.
   *
   * @note Impure: stops the render's abort from withdrawing the story.
   */
  readonly scheduleWithdrawal: BeforeEach<Renderer>;
};

/** Whether MSW serves a story: unless the toolbar or `disable` turns it off. */
const isActive = (
  enabled: unknown,
  parameter: MswParameter | undefined,
): boolean => enabled !== false && !(parameter?.disable ?? false);

/**
 * Create the registry that serves every shown story's
 * `parameters.msw.handlers` together, the story served last first.
 *
 * `import { createStoryRegistry } from "./lib/worker/index.js";`
 *
 * @param start - Starts the worker, or resolves null where none starts.
 * @returns The loader that serves a story, and the beforeEach whose cleanup
 * withdraws it.
 */
export default function createStoryRegistry(
  start: () => Promise<SetupWorker | null> = startWorker,
): StoryRegistry {
  const shown = new Map<string, readonly RequestHandler[]>();
  const disarms = new WeakMap<AbortSignal, AbortController>();
  let serving: SetupWorker | null = null;

  /** List every shown story's handlers, the story served last first. */
  const listShownHandlers = (): RequestHandler[] =>
    [...shown.values()].reverse().flat();

  /** Whether any of `handlers` is no longer among the shown stories'. */
  const isAnyLeaving = (handlers: readonly RequestHandler[]): boolean => {
    const kept = new Set(listShownHandlers());
    return handlers.some((handler) => !kept.has(handler));
  };

  /**
   * Serve the shown stories' handlers again, from msw's empty initial list.
   *
   * @note Impure: replaces the worker's handlers.
   */
  const rebuildServed = (): void => {
    serving?.resetHandlers();
    serving?.use(...listShownHandlers());
  };

  /**
   * Withdraw a story, and serve the rest.
   *
   * @note Impure: removes the story from the registry.
   */
  const withdrawStory = (id: string): void => {
    const withdrawn = shown.get(id);
    shown.delete(id);
    if (withdrawn !== undefined && isAnyLeaving(withdrawn)) {
      rebuildServed();
    }
  };

  /**
   * Serve a story's handlers first, adding them alone unless some leave.
   *
   * @note Impure: registers the story and changes the worker's handlers.
   */
  const serveOn = (
    worker: SetupWorker | null,
    id: string,
    handlers: readonly RequestHandler[],
  ): void => {
    const previous = shown.get(id) ?? [];
    shown.delete(id);
    shown.set(id, handlers);
    if (worker !== null && worker !== serving) {
      serving = worker;
      rebuildServed();
    } else if (isAnyLeaving(previous)) {
      rebuildServed();
    } else {
      serving?.use(...handlers);
    }
  };

  return {
    serveStory: async ({ id, globals, parameters, abortSignal }) => {
      const parameter: MswParameter | undefined = Reflect.get(
        parameters,
        PARAM_KEY,
      );
      if (!isActive(Reflect.get(globals, KEY), parameter)) {
        withdrawStory(id);
        return;
      }
      const worker = await start();
      if (abortSignal.aborted) {
        return;
      }
      serveOn(worker, id, parameter?.handlers ?? []);
      disarms.get(abortSignal)?.abort();
      const disarm = new AbortController();
      disarms.set(abortSignal, disarm);
      abortSignal.addEventListener("abort", () => withdrawStory(id), {
        once: true,
        signal: disarm.signal,
      });
    },
    scheduleWithdrawal: ({ id, abortSignal }) => {
      disarms.get(abortSignal)?.abort();
      disarms.delete(abortSignal);
      return () => withdrawStory(id);
    },
  };
}
