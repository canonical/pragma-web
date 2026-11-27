import previewConfig from "@canonical/storybook-config/preview";
import "./styles.css";

const preview = {
  ...previewConfig,
  // Storybook statically parses `preview.ts` for `storySort` and requires the
  // order to be an inline literal, so both `tags` and the order are declared
  // inline here rather than inherited from `@canonical/storybook-config`.
  tags: ["autodocs"],
  parameters: {
    ...previewConfig.parameters,
    options: {
      storySort: {
        order: [
          "Documentation",
          ["Introduction", "*"],
          "subcomponents",
          "components",
          "groups",
          "patterns",
          "common",
          "utils",
          "_work_in_progress",
        ],
      },
    },
  },
};

export default preview;
