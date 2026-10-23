// Scaffolded by @canonical/summon-component:react v0.43.0

import type { Meta, StoryObj } from "@storybook/react-vite";
import ScaffoldedProbe from "./ScaffoldedProbe.js";

const meta: Meta<typeof ScaffoldedProbe> = {
  title: "Components/ScaffoldedProbe",
  component: ScaffoldedProbe,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof ScaffoldedProbe>;

export const Default: Story = {
  args: {
    label: "ScaffoldedProbe",
  },
};
