import previewConfig from "@canonical/storybook-config/preview";
import type { Preview } from "@storybook/react-vite";

import "./styles.css";

const preview: Preview = {
  ...previewConfig,
  parameters: {
    ...previewConfig.parameters,
    // Every story is checked by the accessibility addon, and a violation
    // fails its test rather than only showing in the panel.
    a11y: { test: "error" },
    // Inline, not imported: Storybook reads the order statically and rejects
    // an imported one (https://github.com/storybookjs/storybook/issues/31842).
    options: {
      storySort: {
        order: [
          "Documentation",
          "subcomponents",
          "components",
          "groups",
          "patterns",
          "common",
          "utils",
          "_work_in_progress",
          [
            "DataViews",
            "Search",
            "Filters",
            "SortPanel",
            "Settings",
            "Actions",
            "Pagination",
            "PaginationBar",
            "SavedViews",
            "Renderers",
            ["DataTable", "DataCards", "DataChart", "DataChartWithTable"],
            "In context",
            ["Composition", "REST API", "GraphQL API", "Recipes"],
          ],
        ],
      },
    },
  },
  // https://github.com/storybookjs/storybook/issues/31842
  tags: ["autodocs"],
};

export default preview;
