// Scaffolded by @canonical/summon-component:react v0.46.0

import { withRelayEnvironment } from "@canonical/storybook-addon-relay";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { withPaletteSite } from "../../../../.storybook/decorators/index.js";
import {
  COMPONENT_HREF,
  ONTOLOGY_CLASS_HREF,
} from "../../../../testing/fixtures.js";
import Component from "./CommandPaletteJump.js";

const meta: Meta<typeof Component> = {
  title: "Components/CommandPaletteJump",
  component: Component,
  tags: ["autodocs"],
  decorators: [withPaletteSite(), withRelayEnvironment],
  args: {
    onChoose: () => undefined,
    destinations: {
      places: [
        { label: "Components", href: COMPONENT_HREF },
        { label: "Definitions", href: ONTOLOGY_CLASS_HREF },
      ],
      recent: [{ label: "Layout switcher", href: COMPONENT_HREF }],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Component>;

/** Every destination, under its group's heading, none highlighted. */
export const Default: Story = {};

/** Narrowed by the field's text, the arrow key highlighting the first. */
export const Narrowed: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const field = canvas.getByRole("combobox");
    await userEvent.type(field, "def");
    await userEvent.keyboard("{ArrowDown}");
    await expect(
      canvas.getByRole("option", { selected: true }),
    ).toHaveTextContent("Definitions");
  },
};

/** A text no destination's name holds. */
export const NoMatch: Story = {
  args: { initialText: "zzzz" },
};
