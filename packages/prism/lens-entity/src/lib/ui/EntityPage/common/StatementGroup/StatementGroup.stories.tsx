import type { Meta, StoryObj } from "@storybook/react-vite";
import { withSite } from "../../../../../../.storybook/decorators/index.js";
import { answerFromRecords } from "../../../../../../.storybook/mocks/index.js";
import {
  CENTRAL_EXCHANGE_CURIE,
  CIRCLE_LINE_CURIE,
  LINES_BINDING,
  STATIONS_BINDING,
} from "../../../../../../testing/fixtures.js";
import { EntityPage } from "../../index.js";
import Component from "./StatementGroup.js";

/**
 * The component reads a fragment of the entity page's statements, so the
 * stories render it through the entity page, on a site that serves them.
 */
const meta: Meta<typeof Component> = {
  title: "Components/EntityPage/StatementGroup",
  component: Component,
  tags: ["autodocs"],
  parameters: {
    grid: "intrinsic",
    relay: { generateFunction: answerFromRecords() },
  },
};

export default meta;
type Story = StoryObj<typeof Component>;

/** A station's groups: the lines it serves as chips, its numbers as text. */
export const Default: Story = {
  decorators: [
    withSite({
      url: `/stations/${encodeURIComponent(CENTRAL_EXCHANGE_CURIE)}`,
      extensions: ["source", "statements"],
    }),
  ],
  render: () => (
    <EntityPage
      binding={STATIONS_BINDING}
      label="Stations"
      uri={CENTRAL_EXCHANGE_CURIE}
    />
  ),
};

/** A line's groups, with what points at it under Referenced by. */
export const ReferencedBy: Story = {
  decorators: [
    withSite({
      url: `/lines/${encodeURIComponent(CIRCLE_LINE_CURIE)}`,
      extensions: ["source", "statements"],
    }),
  ],
  render: () => (
    <EntityPage binding={LINES_BINDING} label="Lines" uri={CIRCLE_LINE_CURIE} />
  ),
};
