/**
 * `@canonical/prism-core`'s chrome ships no Storybook of its own; its
 * stories live in the docs site, rendered over the site's styles.
 */

import { ModeStrip as Component } from "@canonical/prism-core";
import type { Meta, StoryObj } from "@storybook/react-vite";

const meta: Meta<typeof Component> = {
  title: "Prism/ModeStrip",
  component: Component,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Component>;

/** An unclaimed strip: every group keeps its place, empty. */
export const EmptySockets: Story = {};

/** An index's strip: the trail, the view group, Search and the count. */
export const Claimed: Story = {
  args: {
    trail: "Components",
    view: <a href="?as=cards">Cards</a>,
    search: <input aria-label="Search components" type="search" />,
    count: <span>48 of 48 components</span>,
  },
};
