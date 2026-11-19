import { Button } from "@canonical/react-ds-global";
import type { Meta, StoryFn } from "@storybook/react-vite";
import { fn } from "storybook/test";
// The parts read the panel's shared tokens (inline padding, gaps, border),
// which the panel's own stylesheet declares.
import "../../styles.css";
import Component from "./Footer.js";

const meta = {
  title: "Components/SidePanel/Footer",
  component: Component,
  parameters: {
    // The part alone, edge to edge: nothing in the snapshot but the part.
    layout: "fullscreen",
    docs: {
      // The consumer composes the sections on a `SidePanel`, so serve the
      // consumer-facing snippet explicitly instead of the story's own source.
      source: { type: "code", language: "tsx" },
    },
  },
} satisfies Meta<typeof Component>;

export default meta;

export const Default: StoryFn = () => (
  <Component>
    <Button importance="primary" anticipation="constructive" onClick={fn()}>
      Subscribe
    </Button>
    <Button onClick={fn()}>Cancel</Button>
  </Component>
);
Default.parameters = {
  docs: {
    source: {
      code: `<SidePanel.Footer>
  <Button importance="primary" anticipation="constructive">
    Subscribe
  </Button>
  <Button>Cancel</Button>
</SidePanel.Footer>`,
    },
  },
};
