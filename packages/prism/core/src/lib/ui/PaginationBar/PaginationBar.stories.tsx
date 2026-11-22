// Scaffolded by @canonical/summon-component:react v0.46.0

import type { Meta, StoryObj } from "@storybook/react-vite";
import { withRouter } from "../../../../.storybook/decorators/index.js";
import PaginationBar from "./PaginationBar.js";

const meta: Meta<typeof PaginationBar> = {
  title: "Components/PaginationBar",
  component: PaginationBar,
  tags: ["autodocs"],
  decorators: [withRouter("/catalog")],
};

export default meta;
type Story = StoryObj<typeof PaginationBar>;

/** The first page of more: no previous link. */
export const Default: Story = {
  args: { label: "1–20 of 41", nextHref: "/catalog?page=2" },
};

/** A page in the middle: both ends. */
export const Middle: Story = {
  args: {
    label: "21–40 of 61",
    previousHref: "/catalog",
    nextHref: "/catalog?page=3",
  },
};

/** The one page of a short set: the position alone. */
export const Single: Story = { args: { label: "1–8 of 8" } };
