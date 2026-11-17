import type {
  LoaderFunction,
  PreparedStory,
  ProjectAnnotations,
  Renderer,
  StoryAnnotations,
  StoryContext,
} from "storybook/internal/types";
import {
  normalizeProjectAnnotations,
  normalizeStory,
  prepareStory,
} from "storybook/preview-api";
import { KEY } from "../src/constants.js";

/** One render of a prepared story. */
type StoryRender = {
  readonly story: PreparedStory<Renderer>;
  /** The context Storybook passes the story's loaders and beforeEach. */
  readonly context: StoryContext<Renderer>;
  /** Aborts the render, as a teardown does. */
  readonly render: AbortController;
};

/**
 * Prepare a story of a `utils/middleware` file under `preview`, as
 * Storybook does to render it, with MSW on.
 *
 * `import prepareStoryRender from "./prepareStoryRender.js";`
 */
export default function prepareStoryRender(
  preview: ProjectAnnotations<Renderer>,
  name: string,
  annotations: StoryAnnotations<Renderer> = {},
  metaLoaders: LoaderFunction<Renderer>[] = [],
): StoryRender {
  const meta = {
    id: "middleware",
    title: "utils/middleware",
    loaders: metaLoaders,
  };
  const story = prepareStory(
    normalizeStory(name, { render: () => null, ...annotations }, meta),
    meta,
    normalizeProjectAnnotations(preview),
  );
  const render = new AbortController();
  const context = {
    ...story,
    args: story.initialArgs,
    globals: { [KEY]: true },
    abortSignal: render.signal,
    loaded: {},
  } as unknown as StoryContext<Renderer>;
  return { story, context, render };
}
