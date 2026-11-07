import type { SetupWorker } from "msw/browser";
import type {
  ProjectAnnotations,
  Renderer,
  StoryAnnotations,
} from "storybook/internal/types";
import { composeStory } from "storybook/preview-api";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import createWorker from "../testing/createWorker.js";
import { options } from "../testing/fixtures.js";
import prepareStoryRender from "../testing/prepareStoryRender.js";
import readAnswer from "../testing/readAnswer.js";
import stubBrowserProcess from "../testing/stubBrowserProcess.js";
import { KEY } from "./constants.js";

const browser = vi.hoisted(() => ({ setupWorker: vi.fn() }));

// msw/browser is the browser's network boundary: it registers a service
// worker, which jsdom cannot run. Its fake keeps handlers as msw does.
vi.mock("msw/browser", () => ({ setupWorker: browser.setupWorker }));

const meta = { id: "middleware", title: "utils/middleware" };

/** The worker the fake msw/browser hands the preview in each case. */
let worker: SetupWorker;

/** Puts the test's Node version back after each case. */
let restoreProcess = (): void => undefined;

/**
 * Load a fresh copy of the preview, with no worker started and no story
 * shown.
 *
 * @note Impure: resets the module registry.
 */
const loadPreview = async (): Promise<ProjectAnnotations<Renderer>> => {
  vi.resetModules();
  return (await import("./preview.js")).default;
};

/**
 * Compose the story exported as `name`, whose render records what
 * `GET /api/options` is answered with while it renders.
 */
const composeRecording = (
  preview: ProjectAnnotations<Renderer>,
  name: string,
  annotations: StoryAnnotations<Renderer> = {},
) => {
  const answers: (number | undefined)[] = [];
  const project = {
    ...preview,
    renderToCanvas: async () => {
      answers.push(await readAnswer(worker, "/api/options"));
    },
  };
  const story = composeStory(
    { render: () => null, ...annotations },
    meta,
    project,
    {},
    name,
  );
  return { story, answers };
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

describe("preview", () => {
  it("turns MSW on for every story until the toolbar turns it off", async () => {
    const preview = await loadPreview();
    expect(preview.initialGlobals).toEqual({ [KEY]: true });
  });

  it("serves a story's handlers before its meta's and its own loaders run", async () => {
    const preview = await loadPreview();
    const { story, context } = prepareStoryRender(
      preview,
      "Loading",
      {
        parameters: { msw: { handlers: [options] } },
        loaders: [
          async () => ({ story: await readAnswer(worker, "/api/options") }),
        ],
      },
      [async () => ({ meta: await readAnswer(worker, "/api/options") })],
    );
    await expect(story.applyLoaders(context)).resolves.toEqual({
      meta: 200,
      story: 200,
    });
  });

  it("serves a story's handlers before it renders", async () => {
    const preview = await loadPreview();
    const { story, answers } = composeRecording(preview, "WithHandlers", {
      parameters: { msw: { handlers: [options] } },
    });
    await story.run();
    expect(answers).toEqual([200]);
  });

  it("serves a story without handlers none, after a story with them", async () => {
    const preview = await loadPreview();
    const withHandlers = composeRecording(preview, "WithHandlers", {
      parameters: { msw: { handlers: [options] } },
    });
    const without = composeRecording(preview, "WithoutHandlers");
    await withHandlers.story.run();
    await without.story.run();
    expect(withHandlers.answers).toEqual([200]);
    expect(without.answers).toEqual([undefined]);
  });

  it("serves nothing once the toolbar turns MSW off and the story renders again", async () => {
    const preview = await loadPreview();
    const { story, context } = prepareStoryRender(preview, "RESTOptions", {
      parameters: { msw: { handlers: [options] } },
    });
    await story.applyLoaders(context);
    await expect(readAnswer(worker, "/api/options")).resolves.toBe(200);
    await story.applyLoaders({ ...context, globals: { [KEY]: false } });
    await expect(readAnswer(worker, "/api/options")).resolves.toBeUndefined();
  });

  it("registers no decorator, so nothing wraps a story or mounts it again", async () => {
    const preview = await loadPreview();
    expect(preview).not.toHaveProperty("decorators");
  });
});
