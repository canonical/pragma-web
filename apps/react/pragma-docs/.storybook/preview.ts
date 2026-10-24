import previewConfig from "@canonical/storybook-config/preview";
import type { Preview } from "@storybook/react-vite";

import "../src/styles/index.css";
import "./styles.css";

const preview: Preview = {
  ...previewConfig,
  // The stories render parts of a documentation site, so every story renders
  // in the `.docs` context at its comfortable density, as the site's document
  // element declares.
  parameters: { ...previewConfig.parameters, context: "docs" },
};

export default preview;
