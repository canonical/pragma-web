import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import type { BarStoryArgs } from "../../../../../../storybook/bar/index.js";
import {
  countRows,
  readFrameQuery,
  renderBarWith,
  ServerRenderedBar,
} from "../../../../../../storybook/bar/index.js";
import { withAppScope } from "../../../../../../storybook/decorators/index.js";
import Component from "./QueryBar.js";

const meta = {
  title: "patterns/DataViews/Controls/QueryBar/Quick filters",
  tags: ["experimental"],
  component: Component,
  decorators: [withAppScope],
  // The suggestions are a popover in the top layer, which escapes every
  // container, so each docs preview gets its own iframe.
  parameters: {
    docs: { story: { inline: false, iframeHeight: "560px" } },
  },
} satisfies Meta<BarStoryArgs>;

export default meta;
type Story = StoryObj<BarStoryArgs>;

/**
 * Quick filters beside the field: the status as words, one at a time after
 * "All"; the tags as words too, several at once; the pool, the memory and
 * the owner each as a filter button opening its panel. Each word and each
 * tick commits at once, a step of the frame's history; the chips and the
 * quick filters show one query. The pool's panel narrows its twelve pools
 * with a search.
 */
export const QuickFilters: Story = {
  args: {
    quickFilters: [
      "status",
      { field: "tags", arrangement: "words" },
      "pool",
      "memory",
      "owner",
    ],
  },
  render: renderBarWith({ withPools: true, withHistory: true }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() => expect(countRows(canvasElement)).toBe(50));
    await expect(canvas.getByRole("button", { name: "All" })).toHaveAttribute(
      "aria-current",
      "true",
    );
    await expect(canvas.getByRole("button", { name: "pool" })).toHaveAttribute(
      "aria-haspopup",
      "dialog",
    );
  },
};

/**
 * A quick filter whose clause excludes: the trigger shows the Exclusion
 * mark before its count, and its name says "none of 2".
 */
export const Exclusion: Story = {
  args: { quickFilters: [{ field: "status", arrangement: "button" }] },
  render: renderBarWith({
    query: "status__isNone=broken&status__isNone=ready",
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = await canvas.findByRole("button", {
      name: "status, none of 2",
    });
    await userEvent.click(trigger);
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
  },
};

/**
 * No JavaScript, with an address: the quick filters in the server's markup.
 * Each status word is a link to the query with its condition set or
 * removed; the tags' and the owner's panels are GET forms whose Apply keeps
 * the search and every other clause. The frame's `query` parameter sets the address.
 */
export const NoJavaScriptHref: Story = {
  name: "No JavaScript, with an address: quick filters",
  args: { quickFilters: ["status", "tags", "owner"] },
  render: (args) => (
    <ServerRenderedBar
      {...args}
      href={`/machines?${readFrameQuery("status=deployed&memory__gte=8192&q=web")}`}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole("link", { name: "ready" }),
    ).toBeInTheDocument();
    await expect(
      canvas.getByRole("link", { name: "deployed" }),
    ).toHaveAttribute("aria-current", "true");
  },
};

/**
 * No JavaScript, memory: quick filters. Nothing to lead to: the words are
 * text, the current one still marked; the tags' popover still opens, and
 * its controls, with no name, work once scripts run.
 */
export const NoJavaScriptMemory: Story = {
  name: "No JavaScript, memory: quick filters",
  args: { quickFilters: ["status", "tags"] },
  render: (args) => <ServerRenderedBar {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryAllByRole("link")).toHaveLength(0);
    await expect(
      canvasElement.querySelector('.ds.filter-options [aria-current="true"]'),
    ).toHaveTextContent("deployed");
  },
};
