import type { Meta, StoryObj } from "@storybook/react-vite";
import { withRouter } from "../../../../.storybook/decorators/index.js";
import Component from "./MetroRail.js";

const meta = {
  title: "Components/MetroRail",
  component: Component,
  tags: ["autodocs"],
  decorators: [withRouter({ url: "/stations" })],
  parameters: {
    layout: "fullscreen",
    // The rail is an item of the shell's grid, at `1 / span 2`, so the
    // story's container is an intrinsic grid for it to sit on.
    grid: "intrinsic",
  },
} satisfies Meta<typeof Component>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The rail on a stations page: the brand, the three lenses with Stations
 * current, and the theme control. */
export const Default: Story = {};
