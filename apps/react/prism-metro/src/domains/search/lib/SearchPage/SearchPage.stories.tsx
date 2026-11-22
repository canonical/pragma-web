// Scaffolded by @canonical/summon-component:react v0.46.0

import type { Meta, StoryObj } from "@storybook/react-vite";
import { withRouter } from "../../../../../.storybook/decorators/index.js";
import Component from "./SearchPage.js";

const meta = {
  title: "Components/SearchPage",
  component: Component,
  tags: ["autodocs"],
  // The results link through the site's router, so the story mounts it
  // at the search page's address.
  decorators: [withRouter({ url: "/search?q=northgate" })],
  parameters: {
    // The page is a subgrid of the canvas's columns, so the story's
    // container is an intrinsic grid for it to bind to.
    grid: "intrinsic",
  },
} satisfies Meta<typeof Component>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The results for a text: the title, the count and each passage. */
export const Default: Story = { args: { text: "northgate" } };
