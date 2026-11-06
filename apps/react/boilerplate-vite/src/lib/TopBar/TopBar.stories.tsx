import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import withRouter from "../../../.storybook/decorators/withRouter.js";
import { stubRoutes } from "../../testing/fixtures.js";
import Component from "./TopBar.js";

const meta = {
  title: "common/TopBar",
  component: Component,
  decorators: [withRouter({ routes: stubRoutes })],
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof Component>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * The bar every page opens with: the app's name, the demo navigation, and the
 * theme and language selectors at the end.
 */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByRole("banner")).toBeVisible();
    await expect(canvas.getAllByRole("combobox")).toHaveLength(2);
  },
};
