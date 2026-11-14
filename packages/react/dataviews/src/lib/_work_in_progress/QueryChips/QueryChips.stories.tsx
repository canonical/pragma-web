import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, within } from "storybook/test";
import { withServerMarkup } from "../../../storybook/decorators.js";
import { QueryChip } from "../QueryChip/index.js";
import Component from "./QueryChips.js";

const { Segment } = QueryChip;

const chips = [
  <QueryChip
    key="status"
    onRemove={fn()}
    removeLabel="Remove status is any of deployed, ready"
  >
    <Segment>status</Segment>
    <Segment condition="inclusion">is any of</Segment>
    <Segment>deployed, ready</Segment>
  </QueryChip>,
  <QueryChip
    key="cpu"
    onRemove={fn()}
    removeLabel="Remove cpu between 4 and 16"
  >
    <Segment>cpu</Segment>
    <Segment condition="range">between</Segment>
    <Segment>4 and 16</Segment>
  </QueryChip>,
  <QueryChip key="search" onRemove={fn()} removeLabel="Remove search web">
    <Segment>web</Segment>
  </QueryChip>,
];

const meta = {
  title: "_work_in_progress/QueryChips",
  component: Component,
  args: {
    label: "Filters",
    children: chips,
  },
} satisfies Meta<typeof Component>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The clauses that narrow a collection, as one named list. */
export const Default: Story = {};

/** The chips wrap onto new lines when the row runs out of room. */
export const Wrapping: Story = {
  render: (args) => (
    <div style={{ inlineSize: "20rem" }}>
      <Component {...args}>
        {chips}
        <QueryChip key="long" onRemove={fn()} removeLabel="Remove description">
          <Segment>description</Segment>
          <Segment condition="match">contains</Segment>
          <Segment>a value far too long to fit on one line of this row</Segment>
        </QueryChip>
      </Component>
    </div>
  ),
  play: async ({ canvasElement }) => {
    // A long chip fits the row, its text cut short, rather than overflowing.
    const list = await within(canvasElement).findByRole("list");
    await expect(list.scrollWidth).toBeLessThanOrEqual(list.clientWidth);
  },
};

/** Named by a visible heading through `aria-labelledby`. */
export const NamedByHeading: Story = {
  render: () => (
    <section>
      <h2 id="applied-filters">Applied filters</h2>
      <Component aria-labelledby="applied-filters">{chips}</Component>
    </section>
  ),
};

/** The markup a server sends before any script runs. */
export const WithoutScripts: Story = {
  decorators: [withServerMarkup],
  render: (args) => <Component {...args} />,
};
