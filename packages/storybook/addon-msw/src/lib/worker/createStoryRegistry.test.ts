import { HttpResponse, http } from "msw";
import type { SetupWorker } from "msw/browser";
import type {
  CleanupCallback,
  Renderer,
  StoryContext,
} from "storybook/internal/types";
import { afterEach, describe, expect, it, vi } from "vitest";
import createWorker from "../../../testing/createWorker.js";
import { machines, options, validation } from "../../../testing/fixtures.js";
import readAnswer from "../../../testing/readAnswer.js";
import { KEY } from "../../constants.js";
import type { MswParameter } from "../../types.js";
import createStoryRegistry from "./createStoryRegistry.js";

/** What a story declares and how it is shown, for one render. */
type StoryRender = {
  readonly id: string;
  readonly msw?: MswParameter;
  readonly enabled?: boolean;
  readonly abortSignal?: AbortSignal;
};

/** Create the context Storybook passes a story's loaders for one render. */
const createContext = ({
  id,
  msw,
  enabled = true,
  abortSignal = new AbortController().signal,
}: StoryRender): StoryContext<Renderer> =>
  ({
    id,
    globals: { [KEY]: enabled },
    parameters: msw === undefined ? {} : { msw },
    abortSignal,
  }) as unknown as StoryContext<Renderer>;

/**
 * Render a story as Storybook does: its loaders, then its beforeEach, whose
 * cleanup is returned.
 *
 * @note Impure: serves the story on the registry's worker.
 */
const renderStory = async (
  registry: ReturnType<typeof createStoryRegistry>,
  story: StoryRender,
): Promise<CleanupCallback> => {
  const context = createContext(story);
  await registry.serveStory(context);
  const cleanup = await registry.scheduleWithdrawal(context);
  if (typeof cleanup !== "function") {
    throw new Error("The beforeEach returned no cleanup");
  }
  return cleanup;
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe("createStoryRegistry", () => {
  describe("serveStory", () => {
    it("serves every shown story's handlers at once, the story served last first", async () => {
      const worker = createWorker();
      const registry = createStoryRegistry(async () => worker);
      await renderStory(registry, { id: "a", msw: { handlers: [options] } });
      await renderStory(registry, {
        id: "b",
        msw: { handlers: [validation, machines] },
      });
      expect(worker.listHandlers()).toEqual([validation, machines, options]);
    });

    it("serves stories waiting on one start together, as a docs page does", async () => {
      const worker = createWorker();
      let finishStart = (): void => undefined;
      const starting = new Promise<SetupWorker>((resolve) => {
        finishStart = () => resolve(worker);
      });
      const start = vi.fn(() => starting);
      const registry = createStoryRegistry(start);
      const first = registry.serveStory(
        createContext({ id: "a", msw: { handlers: [options] } }),
      );
      const second = registry.serveStory(
        createContext({ id: "b", msw: { handlers: [validation] } }),
      );
      finishStart();
      await Promise.all([first, second]);
      expect(worker.listHandlers()).toEqual([validation, options]);
    });

    it("serves a story served again in its own place, never twice", async () => {
      const worker = createWorker();
      const registry = createStoryRegistry(async () => worker);
      await renderStory(registry, { id: "a", msw: { handlers: [options] } });
      await renderStory(registry, { id: "b", msw: { handlers: [validation] } });
      await renderStory(registry, { id: "a", msw: { handlers: [machines] } });
      expect(worker.listHandlers()).toEqual([machines, validation]);
    });

    it("serves a story without handlers none, after a story with them", async () => {
      const worker = createWorker();
      const registry = createStoryRegistry(async () => worker);
      const cleanup = await renderStory(registry, {
        id: "a",
        msw: { handlers: [options] },
      });
      await cleanup();
      await renderStory(registry, { id: "plain" });
      await renderStory(registry, { id: "opted-in", msw: { disable: false } });
      expect(worker.listHandlers()).toEqual([]);
      await expect(readAnswer(worker, "/api/options")).resolves.toBeUndefined();
    });

    it("withdraws only the story MSW is off for, by the toolbar or by the story", async () => {
      const worker = createWorker();
      const registry = createStoryRegistry(async () => worker);
      await renderStory(registry, { id: "a", msw: { handlers: [options] } });
      await renderStory(registry, { id: "b", msw: { handlers: [validation] } });
      await renderStory(registry, {
        id: "b",
        msw: { handlers: [validation] },
        enabled: false,
      });
      expect(worker.listHandlers()).toEqual([options]);
      await renderStory(registry, { id: "b", msw: { handlers: [validation] } });
      await renderStory(registry, {
        id: "a",
        msw: { handlers: [options], disable: true },
      });
      expect(worker.listHandlers()).toEqual([validation]);
    });

    it("serves nothing once the toolbar turns MSW off for the only story shown", async () => {
      const worker = createWorker();
      const registry = createStoryRegistry(async () => worker);
      await renderStory(registry, { id: "a", msw: { handlers: [options] } });
      await renderStory(registry, {
        id: "a",
        msw: { handlers: [options] },
        enabled: false,
      });
      expect(worker.listHandlers()).toEqual([]);
      await expect(readAnswer(worker, "/api/options")).resolves.toBeUndefined();
    });

    it("never starts the worker for a story MSW is off for", async () => {
      const start = vi.fn(async () => createWorker());
      const registry = createStoryRegistry(start);
      await renderStory(registry, {
        id: "a",
        msw: { handlers: [options] },
        enabled: false,
      });
      expect(start).not.toHaveBeenCalled();
    });

    it("serves nothing for a story torn down while the worker starts", async () => {
      const worker = createWorker();
      let finishStart = (): void => undefined;
      const starting = new Promise<SetupWorker>((resolve) => {
        finishStart = () => resolve(worker);
      });
      const registry = createStoryRegistry(() => starting);
      const render = new AbortController();
      const served = registry.serveStory(
        createContext({
          id: "a",
          msw: { handlers: [options] },
          abortSignal: render.signal,
        }),
      );
      render.abort();
      finishStart();
      await served;
      await renderStory(registry, { id: "b", msw: { handlers: [validation] } });
      expect(worker.listHandlers()).toEqual([validation]);
    });

    it("withdraws a story whose render is aborted after it is served", async () => {
      const worker = createWorker();
      const registry = createStoryRegistry(async () => worker);
      const render = new AbortController();
      await registry.serveStory(
        createContext({
          id: "a",
          msw: { handlers: [options] },
          abortSignal: render.signal,
        }),
      );
      await renderStory(registry, { id: "b", msw: { handlers: [validation] } });
      render.abort();
      expect(worker.listHandlers()).toEqual([validation]);
    });

    it("keeps a story served when its render is aborted after its beforeEach, as a hot update cancelling its play does", async () => {
      const worker = createWorker();
      const registry = createStoryRegistry(async () => worker);
      const render = new AbortController();
      await renderStory(registry, {
        id: "a",
        msw: { handlers: [options] },
        abortSignal: render.signal,
      });
      render.abort();
      expect(worker.listHandlers()).toEqual([options]);
    });

    it("keeps another story's sequential responses where they were", async () => {
      const worker = createWorker();
      const registry = createStoryRegistry(async () => worker);
      const job = http.get("/api/job", function* () {
        yield HttpResponse.json({ state: "pending" }, { status: 202 });
        return HttpResponse.json({ state: "done" });
      });
      await renderStory(registry, { id: "a", msw: { handlers: [job] } });
      await expect(readAnswer(worker, "/api/job")).resolves.toBe(202);
      await renderStory(registry, { id: "b", msw: { handlers: [options] } });
      await expect(readAnswer(worker, "/api/job")).resolves.toBe(200);
    });

    it("lets a story render against the network when no worker starts, and serves it once one does", async () => {
      const worker = createWorker();
      const start = vi
        .fn<() => Promise<SetupWorker | null>>()
        .mockResolvedValueOnce(null)
        .mockResolvedValue(worker);
      const registry = createStoryRegistry(start);
      await renderStory(registry, { id: "a", msw: { handlers: [options] } });
      expect(worker.listHandlers()).toEqual([]);
      await renderStory(registry, { id: "b", msw: { handlers: [validation] } });
      expect(worker.listHandlers()).toEqual([validation, options]);
    });

    it("keeps serving on the started worker when a later start resolves none", async () => {
      const worker = createWorker();
      const start = vi
        .fn<() => Promise<SetupWorker | null>>()
        .mockResolvedValueOnce(worker)
        .mockResolvedValue(null);
      const registry = createStoryRegistry(start);
      const cleanupA = await renderStory(registry, {
        id: "a",
        msw: { handlers: [options] },
      });
      await renderStory(registry, { id: "b", msw: { handlers: [validation] } });
      expect(worker.listHandlers()).toEqual([validation, options]);
      await cleanupA();
      expect(worker.listHandlers()).toEqual([validation]);
    });

    it("never disposes a shown story's handlers when another story is served", async () => {
      const worker = createWorker();
      const registry = createStoryRegistry(async () => worker);
      const disposeOptions = vi.spyOn(options, "dispose");
      await renderStory(registry, { id: "a", msw: { handlers: [options] } });
      await renderStory(registry, { id: "b", msw: { handlers: [validation] } });
      await renderStory(registry, { id: "b", msw: { handlers: [validation] } });
      expect(disposeOptions).not.toHaveBeenCalled();
      expect(worker.listHandlers()).toEqual([validation, options]);
    });

    it("keeps a handler two shown stories share when one of them is withdrawn", async () => {
      const worker = createWorker();
      const registry = createStoryRegistry(async () => worker);
      await renderStory(registry, { id: "a", msw: { handlers: [options] } });
      const cleanupB = await renderStory(registry, {
        id: "b",
        msw: { handlers: [options] },
      });
      const disposeOptions = vi.spyOn(options, "dispose");
      await cleanupB();
      expect(disposeOptions).not.toHaveBeenCalled();
      expect(worker.listHandlers()).toEqual([options]);
    });

    it("starts the preview's own worker by default, which resolves none in Node", async () => {
      const registry = createStoryRegistry();
      const cleanup = await renderStory(registry, {
        id: "a",
        msw: { handlers: [options] },
      });
      expect(cleanup).toBeTypeOf("function");
    });
  });

  describe("scheduleWithdrawal", () => {
    it("returns a cleanup that leaves the other stories' handlers in place, as on a docs page or at a remount", async () => {
      const worker = createWorker();
      const registry = createStoryRegistry(async () => worker);
      const cleanupA = await renderStory(registry, {
        id: "a",
        msw: { handlers: [options] },
      });
      const cleanupB = await renderStory(registry, {
        id: "b",
        msw: { handlers: [validation] },
      });
      await cleanupA();
      expect(worker.listHandlers()).toEqual([validation]);
      await cleanupB();
      expect(worker.listHandlers()).toEqual([]);
    });

    it("withdraws a story once, however many of its renders' cleanups run", async () => {
      const worker = createWorker();
      const registry = createStoryRegistry(async () => worker);
      const firstRender = await renderStory(registry, {
        id: "a",
        msw: { handlers: [options] },
      });
      const secondRender = await renderStory(registry, {
        id: "a",
        msw: { handlers: [options] },
      });
      await renderStory(registry, { id: "b", msw: { handlers: [validation] } });
      await secondRender();
      await firstRender();
      expect(worker.listHandlers()).toEqual([validation]);
    });
  });
});
