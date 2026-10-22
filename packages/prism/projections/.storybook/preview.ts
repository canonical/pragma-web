import previewConfig from "@canonical/storybook-config/preview";
import type { Preview } from "@storybook/react-vite";

import "./styles.css";

const preview: Preview = {
  ...previewConfig,
  // The representations sit in a documentation site, so every story renders
  // in the `.docs` context at its comfortable density.
  parameters: { ...previewConfig.parameters, context: "docs" },
  // https://github.com/storybookjs/storybook/issues/31842
  tags: ["autodocs"],
};

export default preview;
