import type { Meta, StoryObj } from "@storybook/react-vite";
import ComponentProse from "./ComponentProse.js";

const meta: Meta<typeof ComponentProse> = {
  title: "Components/ComponentEntityPage/ComponentProse",
  component: ComponentProse,
  tags: ["autodocs"],
  parameters: { grid: "intrinsic" },
};

export default meta;
type Story = StoryObj<typeof ComponentProse>;

/** A text with a heading, a paragraph and a list. */
export const Default: Story = {
  args: {
    scope: "usage",
    source:
      "## When to use\n\nUse buttons for meaningful interactions that transform, submit, or manipulate data.\n\n- Submitting forms\n- Deleting items\n",
  },
};
