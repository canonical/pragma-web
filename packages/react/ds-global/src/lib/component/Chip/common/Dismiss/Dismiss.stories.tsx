import type { Meta, StoryObj } from "@storybook/react-vite";
import type { CSSProperties } from "react";
import { fn } from "storybook/test";
import Context from "../Context.js";
// The control reads its colour, radius and transition from the enclosing
// chip's tokens — import the chip's styles here to define them.
import "../../styles.css";
import Component from "./Dismiss.js";

/**
 * The chip tokens the control inherits from its enclosing chip, supplied
 * directly so the story can render the control alone. Mirrors the
 * declarations on `.ds.chip`.
 */
const chipTokens = {
  "--chip-border-radius": "var(--dimension-radius-full)",
  "--chip-color-icon":
    "var(--modifier-color-icon-on-foreground-secondary, var(--color-icon-onForegroundSecondary))",
  "--chip-transition-duration": "0.1s",
} as CSSProperties;

const meta = {
  title: "components/Chip/Dismiss",
  component: Component,
  args: {
    onClick: fn(),
  },
  argTypes: {
    disabled: { control: { type: "boolean" } },
    onClick: { control: false },
  },
  // A context stands in for the enclosing Chip (outside one the control
  // throws), and its tokens are supplied above, so the story renders the
  // dismiss control on its own.
  decorators: [
    (Story) => (
      <Context.Provider value={{ defaultDismissLabel: "Dismiss Owner: Bob" }}>
        <span style={chipTokens}>
          <Story />
        </span>
      </Context.Provider>
    ),
  ],
} satisfies Meta<typeof Component>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * The dismiss control is named after its chip by default:
 * `Dismiss {lead}: {value}`.
 */
export const Default: Story = {};
