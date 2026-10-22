/**
 * `@canonical/prism-core`'s chrome ships no Storybook of its own; its
 * stories live in the docs site, rendered over the site's styles.
 */

import { Canvas as Component } from "@canonical/prism-core";
import type { Meta, StoryObj } from "@storybook/react-vite";

const meta: Meta<typeof Component> = {
  title: "Prism/Canvas",
  component: Component,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
};

export default meta;
type Story = StoryObj<typeof Component>;

/** A routed page in the canvas, here placeholder prose. */
export const Page: Story = {
  args: {
    children: (
      <section>
        <h1>The canvas</h1>
        <p>The routed page renders here, below the strip.</p>
      </section>
    ),
  },
};

/** A page holding an underground well: a surface sunk below the sheet, where
 * the graph canvases live. */
export const UndergroundWell: Story = {
  args: {
    children: (
      <section>
        <h1>Underground</h1>
        <div
          className="ds underground"
          style={{ blockSize: "16rem", display: "grid", placeItems: "center" }}
        >
          <p>A graph well sinks here.</p>
        </div>
      </section>
    ),
  },
};
