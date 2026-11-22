// Scaffolded by @canonical/summon-component:react v0.46.0

import type { Meta, StoryObj } from "@storybook/react-vite";
import SearchResultGroup from "./SearchResultGroup.js";

const meta: Meta<typeof SearchResultGroup> = {
  title: "Components/SearchResultGroup",
  component: SearchResultGroup,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof SearchResultGroup>;

/** A type with two results. */
export const Default: Story = {
  args: {
    title: "Component",
    count: 2,
    children: (
      <>
        <li>SidePanel</li>
        <li>Button</li>
      </>
    ),
  },
};
