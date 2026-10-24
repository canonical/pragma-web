import previewConfig from "@canonical/storybook-config/preview";
import type { Preview } from "@storybook/react-vite";

import "./styles.css";

const preview: Preview = {
  ...previewConfig,
  // Storybook does not reliably merge the tags and parameters of a preview
  // object spread from an imported module, so both are set here inline
  // (storybookjs/storybook#31842). The palette renders in a documentation
  // site, so every story renders in the `.docs` context at its comfortable
  // density.
  tags: ["autodocs"],
  parameters: {
    ...previewConfig.parameters,
    context: "docs",
    density: "comfortable",
  },
};

export default preview;
