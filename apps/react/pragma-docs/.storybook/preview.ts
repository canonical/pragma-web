import previewConfig from "@canonical/storybook-config/preview";
import type { Preview } from "@storybook/react-vite";

import "../src/styles/index.css";
import "./styles.css";

const preview: Preview = {
  ...previewConfig,
};

export default preview;
