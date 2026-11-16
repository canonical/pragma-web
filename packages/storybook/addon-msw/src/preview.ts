import type { ProjectAnnotations, Renderer } from "storybook/internal/types";
import { KEY } from "./constants.js";
import { createStoryRegistry } from "./lib/worker/index.js";

const registry = createStoryRegistry();

/**
 * The addon's preview annotations: MSW on by default, and each story's
 * handlers served before its own loaders run, until it is torn down.
 *
 * `import preview from "@canonical/storybook-addon-msw/preview";`
 */
const preview = {
  loaders: [registry.serveStory],
  beforeEach: [registry.scheduleWithdrawal],
  initialGlobals: { [KEY]: true },
} satisfies ProjectAnnotations<Renderer>;

export default preview;
