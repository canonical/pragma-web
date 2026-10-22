// The stylesheet comes first, before every component a story can reach: CSS is
// emitted in the order the bundler evaluates the modules that import it, and
// the layer order a browser applies is the one it reads first.
import "../src/styles/index.css";
import previewConfig from "@canonical/storybook-config/preview";
import type { Preview } from "@storybook/react-vite";

const preview: Preview = {
  ...previewConfig,
  // Storybook does not reliably merge the tags and parameters of a preview
  // object spread from an imported module: a story can lose them, so both
  // are set here inline rather than inherited from `previewConfig`
  // (storybookjs/storybook#31842).
  tags: ["autodocs"],
  parameters: {
    ...previewConfig.parameters,
    // Every page of the site renders in the docs context at comfortable
    // density, the classes `SiteDocument` puts on `<html>`. The utilities
    // addon's `withUtilStyles` decorator reads these two parameters and puts
    // `.docs.comfortable` on the story's container, so a story renders in the
    // same context as the page.
    context: "docs",
    density: "comfortable",
  },
};

export default preview;
