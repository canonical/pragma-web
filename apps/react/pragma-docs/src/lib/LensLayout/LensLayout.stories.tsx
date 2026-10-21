import { route } from "@canonical/router-core";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { ModeStrip } from "#lib/ModeStrip";
import { Rail } from "#lib/Rail";
import { withRouter } from "../../../.storybook/decorators/index.js";
import Component from "./LensLayout.js";

/** Name-compatible bare routes, so the rail's links resolve without mounting
 * the app's real pages. A name the rail links to and this table lacks makes
 * `buildPath` throw and the story fail to render. */
const bareRoutes = {
  home: route({ url: "/", content: () => null }),
  components: route({ url: "/components", content: () => null }),
  definitions: route({ url: "/definitions", content: () => null }),
  standards: route({ url: "/standards", content: () => null }),
  journeys: route({ url: "/journeys", content: () => null }),
  guides: route({ url: "/guides", content: () => null }),
  playground: route({ url: "/playground", content: () => null }),
  account: route({ url: "/account", content: () => null }),
} as const;

const meta: Meta<typeof Component> = {
  title: "Shell/LensLayout",
  component: Component,
  tags: ["autodocs"],
  decorators: [withRouter({ routes: bareRoutes })],
  parameters: { layout: "fullscreen" },
  args: {
    rail: <Rail />,
    strip: <ModeStrip />,
    footer: (
      <p>Pragma — the design system, documented from its knowledge graph.</p>
    ),
  },
};

export default meta;
type Story = StoryObj<typeof Component>;

/** The whole layout: rail west, strip, canvas and footer east. The canvas
 * holds the routed page — here, placeholder prose. */
export const Layout: Story = {
  args: {
    children: (
      <section>
        <h1>The canvas</h1>
        <p>
          The rail, the strip and the footer are the lens's own; the routed page
          renders here.
        </p>
      </section>
    ),
  },
};

/** The underground surface hook (AX.3): a well sunk below the sheet, where
 * the graph canvases live. */
export const UndergroundWell: Story = {
  args: {
    children: (
      <section>
        <h1>Underground</h1>
        <div
          className="underground"
          style={{ blockSize: "16rem", display: "grid", placeItems: "center" }}
        >
          <p>A graph well sinks here.</p>
        </div>
      </section>
    ),
  },
};
