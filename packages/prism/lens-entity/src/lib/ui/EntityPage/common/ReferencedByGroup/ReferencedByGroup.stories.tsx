import type { Meta, StoryObj } from "@storybook/react-vite";
import { withSite } from "../../../../../../.storybook/decorators/index.js";
import { answerFromRecords } from "../../../../../../.storybook/mocks/index.js";
import {
  CIRCLE_LINE_CURIE,
  LINES_BINDING,
} from "../../../../../../testing/fixtures.js";
import { EntityPage } from "../../index.js";
import Component from "./ReferencedByGroup.js";

/**
 * The component reads a fragment of the entity page's statements, so the
 * story renders it through the entity page, on a site that serves them.
 */
const meta: Meta<typeof Component> = {
  title: "Components/EntityPage/ReferencedByGroup",
  component: Component,
  tags: ["autodocs"],
  parameters: {
    grid: "intrinsic",
    relay: { generateFunction: answerFromRecords() },
  },
};

export default meta;
type Story = StoryObj<typeof Component>;

/** A line's Referenced by section: the stations that serve it, as one group. */
export const Default: Story = {
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
