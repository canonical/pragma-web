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

/** An unclaimed strip: every socket renders its sensible empty. */
export const EmptySockets: Story = {};

/** A dense strip, as an explorer lens claims it. */
export const Claimed: Story = {
  args: {
    context: "Definitions",
    controls: (
      <>
        <button type="button">Validated</button>
        <button type="button">Proposal</button>
      </>
    ),
    status: <span>19 of 31 classes validated</span>,
  },
};
