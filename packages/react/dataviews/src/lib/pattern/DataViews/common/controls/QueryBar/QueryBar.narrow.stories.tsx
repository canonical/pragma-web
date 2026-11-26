import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import type { BarStoryArgs } from "../../../../../../storybook/bar/index.js";
import {
  NARROW_QUERY,
  PHONE_SIZE,
  readFrameQuery,
  renderBarWith,
  ServerRenderedBar,
} from "../../../../../../storybook/bar/index.js";
import { withAppScope } from "../../../../../../storybook/decorators/index.js";
import Component from "./QueryBar.js";

const meta = {
  title: "_work_in_progress/DataViews/QueryBar/Narrow",
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
 * Mobile: below a container width of 37.5rem the chips give way to the
 * search-only entry and a summary button, "Filters, 2 applied", which
 * opens the sheet: the applied chips, "Add filter" and the filters form,
 * every change applying at once, behind which the rows update. The bar
 * stands at a phone's width.
 */
export const Narrow: Story = {
  render: renderBarWith({ query: NARROW_QUERY, inlineSize: PHONE_SIZE }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const summary = await canvas.findByRole("button", {
      name: "Filters, 2 applied",
    });
    await expect(summary).toBeVisible();
    await expect(summary).toHaveAttribute("command", "show-modal");
  },
};

/**
 * Mobile, the sheet open: the summary button pressed, then "Add filter",
 * and a field chosen, so the sheet shows its operator step.
 */
export const SheetOpen: Story = {
  name: "Mobile: the sheet open",
  render: renderBarWith({ query: NARROW_QUERY, inlineSize: PHONE_SIZE }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const summary = await canvas.findByRole("button", {
      name: "Filters, 2 applied",
    });
    await expect(summary).toBeVisible();
    await userEvent.click(summary);
    const sheet = within(
      await waitFor(() =>
        within(canvasElement.ownerDocument.body).getByRole("dialog", {
          name: "Filter records",
        }),
      ),
    );
    await userEvent.click(sheet.getByRole("button", { name: "Add filter" }));
    await userEvent.click(sheet.getByRole("option", { name: "status" }));
    await expect(
      sheet.getByRole("listbox", { name: "Choose an operator for status" }),
    ).toBeVisible();
  },
};

/**
 * Mobile, rows selected: the action bar over the selection stands above
 * the narrow bar, and neither pushes the page wider than the frame.
 */
export const RowsSelected: Story = {
  name: "Mobile, rows selected",
  render: renderBarWith({
    query: NARROW_QUERY,
    inlineSize: PHONE_SIZE,
    selected: ["bm-01", "bm-02"],
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("2 selected")).toBeVisible();
    await expect(
      await canvas.findByRole("button", { name: "Filters, 2 applied" }),
    ).toBeVisible();
  },
};

/**
 * No JavaScript, with an address, narrow: the server's markup at 22.5rem.
 * The summary button opens the sheet through its invoker command, with no
 * script; inside, each chip's remove control and Clear all are links, and
 * Apply submits the filters' GET form, which keeps the search.
 */
export const NoJavaScriptHref: Story = {
  name: "No JavaScript, with an address, narrow",
  render: (args) => (
    <ServerRenderedBar
      {...args}
      inlineSize="22.5rem"
      href={`/machines?${readFrameQuery(`${NARROW_QUERY}&q=web`)}`}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole("button", { name: "Filters, 2 applied" }),
    ).toHaveAttribute("command", "show-modal");
  },
};
