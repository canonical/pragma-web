// Scaffolded by @canonical/summon-component:react v0.46.0

import { withRelayEnvironment } from "@canonical/storybook-addon-relay";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  withProjections,
  withRouter,
} from "../../../../../.storybook/decorators/index.js";
import {
  HOME_ROUTES,
  MOCK_UI_BLOCK,
} from "../../../../../testing/projectionEntities.js";
import resolveRoot from "../../../../../testing/resolveRoot.js";
import Component from "./SearchPage.js";

const meta = {
  title: "Components/SearchPage",
  component: Component,
  tags: ["autodocs"],
  // The results render through the site's projections over a mock graph
  // and link to their homes through the site's router.
  decorators: [
    withProjections(),
    withRouter({ routes: HOME_ROUTES }),
    withRelayEnvironment,
  ],
  parameters: {
    relay: {
      mockResolvers: {
        SearchConnection: () => ({ total: 1 }),
        SearchMatch: () => ({
          passage: "Buttons trigger actions",
          ranges: [{ start: 0, length: 3 }],
        }),
        Node: resolveRoot(MOCK_UI_BLOCK),
      },
    },
    // The page is a subgrid of the canvas's columns, so the story's
    // container is an intrinsic grid for it to bind to.
    grid: "intrinsic",
  },
} satisfies Meta<typeof Component>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The results for a text: the title, the count and each passage. */
export const Default: Story = { args: { text: "but" } };
