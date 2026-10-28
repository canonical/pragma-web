// Scaffolded by @canonical/summon-component:react v0.43.0

import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ElementType, ReactElement } from "react";
import {
  withEnvironment,
  withProjections,
  withRouter,
} from "../../../../../.storybook/decorators/index.js";
import {
  createRecordedEnvironment,
  readRecordedCalls,
  readRecordedLine,
} from "../../../../../testing/readRecordedViews.js";
import Component from "./CallStop.js";

/** The environment the recorded answers are read from and rendered in. */
const RECORDED = createRecordedEnvironment();

const north = readRecordedLine(RECORDED, "north-line");
const [northgate, , , centralExchange] = readRecordedCalls(
  RECORDED,
  "north-line",
);

/** Render the stop in a list, as the strip does. */
const withStopList = (Story: ElementType): ReactElement => (
  <ol style={{ listStyle: "none", padding: 0 }}>
    <Story />
  </ol>
);

const meta = {
  title: "Components/CallStop",
  component: Component,
  tags: ["autodocs"],
  decorators: [
    withStopList,
    withEnvironment(RECORDED),
    withProjections(),
    withRouter({ url: "/network/lines/metro%3Anorth-line" }),
  ],
  parameters: { grid: "intrinsic" },
  args: {
    colour: north.colour,
    lineUri: north.uri,
    node: northgate as NonNullable<typeof northgate>,
  },
} satisfies Meta<typeof Component>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A plain station: its tick in the line's colour and its name. */
export const Station: Story = {};

/** An interchange: a hollow ring, the other lines it meets and the time a
 * transfer takes. */
export const Interchange: Story = {
  args: {
    node: centralExchange as NonNullable<typeof centralExchange>,
  },
};
