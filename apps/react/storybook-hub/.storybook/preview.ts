import previewConfig from "@canonical/storybook-config/preview";
import type { Preview } from "@storybook/react-vite";

import "./styles.css";

const preview: Preview = {
  ...previewConfig,
  // Storybook reads `tags` from this file's source text to build the story
  // index, so the `autodocs` tag spread from the imported preview is not seen
  // and no component docs pages are generated. Declare it inline.
  // https://github.com/storybookjs/storybook/issues/31842
  tags: ["autodocs"],
};

export default preview;
