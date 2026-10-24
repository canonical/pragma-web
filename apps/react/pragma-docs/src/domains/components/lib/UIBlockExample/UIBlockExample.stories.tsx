// Scaffolded by @canonical/summon-component:react v0.43.0

import type { Meta, StoryObj } from "@storybook/react-vite";
import Component from "./UIBlockExample.js";

const meta: Meta<typeof Component> = {
  title: "Components/UIBlockExample",
  component: Component,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Component>;

/** The published Badge over a count. */
export const Badge: Story = { args: { example: "badge" } };

/** The published Button, labelled. */
export const Button: Story = { args: { example: "button" } };

/** The published Chip over a value. */
export const Chip: Story = { args: { example: "chip" } };

/** The published InlineCode over a snippet. */
export const InlineCode: Story = { args: { example: "inlineCode" } };

/** The published KeyboardKey over the Enter key. */
export const KeyboardKey: Story = { args: { example: "keyboardKey" } };
