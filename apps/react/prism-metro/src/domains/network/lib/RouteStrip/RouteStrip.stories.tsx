// Scaffolded by @canonical/summon-component:react v0.43.0

import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  withEnvironment,
  withProjections,
  withRouter,
} from "../../../../../.storybook/decorators/index.js";
import {
  createRecordedEnvironment,
  readRecordedLine,
} from "../../../../../testing/readRecordedViews.js";
import Component from "./RouteStrip.js";

/** The environment the recorded answers are read from and rendered in. */
const RECORDED = createRecordedEnvironment();

const circle = readRecordedLine(RECORDED, "circle-line");
const north = readRecordedLine(RECORDED, "north-line");

const meta = {
  title: "Components/RouteStrip",
  component: Component,
  tags: ["autodocs"],
  decorators: [
    withEnvironment(RECORDED),
    withProjections(),
    withRouter({ url: "/network/lines/metro%3Acircle-line" }),
  ],
  parameters: { grid: "intrinsic" },
  args: {
    colour: circle.colour,
    lineUri: circle.uri,
    node: (circle.strips.at(0) as (typeof circle.strips)[number]).route,
  },
} satisfies Meta<typeof Component>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A loop run both ways: the toggle shows one direction, and the strip
 * continues past both ends. */
export const Loop: Story = {};

/** A line end to end: its interchange ringed, with the lines it meets. */
export const EndToEnd: Story = {
  args: {
    colour: north.colour,
    lineUri: north.uri,
    node: (north.strips.at(0) as (typeof north.strips)[number]).route,
  },
};
