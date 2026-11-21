import type { Meta, StoryObj } from "@storybook/react-vite";
import Component from "./EntityHeader.js";

const meta: Meta<typeof Component> = {
  title: "Components/EntityPage/EntityHeader",
  component: Component,
  tags: ["autodocs"],
  parameters: { grid: "intrinsic" },
  args: {
    title: "Central Exchange",
    address: "metro:central-exchange",
    kind: "Station",
    summary: "The interchange where three lines meet.",
  },
};

export default meta;
type Story = StoryObj<typeof Component>;

/** The mark and the name, the summary, the status line with Copy. */
export const Default: Story = {};

/** An entity with no description: no summary row. */
export const WithoutSummary: Story = { args: { summary: undefined } };
