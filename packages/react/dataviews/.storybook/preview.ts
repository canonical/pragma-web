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
          [
            "Welcome",
            "Getting started",
            "Guides",
            [
              "Composition",
              "Recipes",
              "Without JavaScript",
              "Build your own renderer",
            ],
            "Data sources",
            ["REST API", "GraphQL API"],
            "Messages and internationalization",
          ],
          "subcomponents",
          "components",
          ["QueryInput", "QueryChip", "FilterButton", "FilterOptions"],
          "groups",
          "patterns",
          [
            "DataViews",
            [
              "Controls",
              [
                "QueryBar",
                ["Narrow", "Quick filters"],
                "Filters",
                "Search",
                "SortPanel",
                "SavedViews",
                "Pagination",
                "ActionBar",
              ],
              "Renderers",
              ["DataTable", "DataCards", "DataChart", "DataChartWithTable"],
            ],
          ],
        ],
      },
    },
  },
  // https://github.com/storybookjs/storybook/issues/31842
  tags: ["autodocs"],
};

export default preview;
