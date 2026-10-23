// Scaffolded by @canonical/summon-component:react v0.43.0

import {
  type RelayParameters,
  withRelayEnvironment,
} from "@canonical/storybook-addon-relay";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Suspense } from "react";
import { expect, userEvent, within } from "storybook/test";
import { withPaletteSite } from "../../../../.storybook/decorators/index.js";
import { RANKED_RESULTS } from "../../../../testing/fixtures.js";
import type { NodePayload } from "../../../../testing/types.js";
import Component from "./CommandPaletteSearch.js";

/** The story's mock environment, answering every search with `nodes`. */
const answerWith = (nodes: readonly NodePayload[]): RelayParameters => ({
  mockResolvers: {
    NodeConnection: () => ({ edges: nodes.map((node) => ({ node })) }),
  },
});

const meta: Meta<typeof Component> = {
  title: "Components/CommandPaletteSearch",
  component: Component,
  tags: ["autodocs"],
  decorators: [withPaletteSite(), withRelayEnvironment],
  parameters: { relay: answerWith(RANKED_RESULTS) },
  args: { onChoose: () => undefined, session: 0 },
  render: (args) => (
    <Suspense fallback={null}>
      <Component {...args} />
    </Suspense>
  ),
};

export default meta;
type Story = StoryObj<typeof Component>;

/** The empty field: a one-line hint, and no search sent. */
export const EmptyField: Story = {};

/**
 * A text with results: the rows grouped by type in rank order, the first
 * highlighted, and its card in the preview.
 */
export const Results: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByRole("combobox"), "lay");
    await expect(
      await canvas.findAllByRole("option", { selected: true }),
    ).toHaveLength(1);
  },
};

/** A text nothing in the graph matches: one line naming it. */
export const NoMatches: Story = {
  parameters: { relay: answerWith([]) },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByRole("combobox"), "zzz");
    await expect(
      await canvas.findByText("Nothing in the graph matches “zzz”."),
    ).toBeInTheDocument();
  },
};

/**
 * Below two groups, on a phone: the results take the palette's four
 * columns, and the preview is not shown.
 */
export const Narrow: Story = {
  decorators: [withPaletteSite({ inlineSize: "390px" })],
  play: Results.play,
};
