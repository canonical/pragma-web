/**
 * Regression: a docs page served only the handlers of its last story.
 *
 * A docs page renders each of its stories in one preview, and MSW keeps one
 * list of handlers for the whole preview. The addon wrote that list as if
 * the story rendered last owned it, so on `utils/middleware` RESTOptions'
 * `GET /api/options` went to the network beside RESTValidation.
 */

import type { SetupWorker } from "msw/browser";
import type { ProjectAnnotations, Renderer } from "storybook/internal/types";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import createWorker from "../../../testing/createWorker.js";
import { options, validation } from "../../../testing/fixtures.js";
import prepareStoryRender from "../../../testing/prepareStoryRender.js";
import readAnswer from "../../../testing/readAnswer.js";
import stubBrowserProcess from "../../../testing/stubBrowserProcess.js";

const browser = vi.hoisted(() => ({ setupWorker: vi.fn() }));

// msw/browser is the browser's network boundary: it registers a service
// worker, which jsdom cannot run. Its fake keeps handlers as msw does.
vi.mock("msw/browser", () => ({ setupWorker: browser.setupWorker }));

/** The worker the fake msw/browser hands the preview. */
let worker: SetupWorker;

/** Puts the test's Node version back after the case. */
let restoreProcess = (): void => undefined;

/**
 * Load a fresh copy of the preview, with no worker started.
 *
 * @note Impure: resets the module registry.
 */
const loadPreview = async (): Promise<ProjectAnnotations<Renderer>> => {
  vi.resetModules();
  return (await import("../../preview.js")).default;
};

beforeEach(() => {
  worker = createWorker();
  browser.setupWorker.mockReturnValue(worker);
  restoreProcess = stubBrowserProcess();
});

afterEach(() => {
  restoreProcess();
  vi.clearAllMocks();
});

describe("regression 0001 — a docs page served only its last story", () => {
  it.fails("serves every story of a docs page at once, and a story's teardown leaves the others", async () => {
    const preview = await loadPreview();
    const shown = [
      prepareStoryRender(preview, "Default"),
      prepareStoryRender(preview, "RESTOptions", {
        parameters: { msw: { handlers: [options] } },
      }),
      prepareStoryRender(preview, "RESTValidation", {
        parameters: { msw: { handlers: [validation] } },
      }),
    ];
    const cleanups = await Promise.all(
      shown.map(async ({ story, context }) => {
        await story.applyLoaders(context);
        return story.applyBeforeEach(context);
      }),
    );
    await expect(readAnswer(worker, "/api/options")).resolves.toBe(200);
    await expect(readAnswer(worker, "/api/validate")).resolves.toBe(200);
    shown.at(1)?.render.abort();
    for (const cleanup of cleanups.at(1) ?? []) {
      await cleanup();
    }
    await expect(readAnswer(worker, "/api/options")).resolves.toBeUndefined();
    await expect(readAnswer(worker, "/api/validate")).resolves.toBe(200);
  });
});
