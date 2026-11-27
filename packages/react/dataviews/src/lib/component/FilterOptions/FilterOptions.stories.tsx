import type { Meta, StoryFn } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import {
  withAppScope,
  withRightToLeft,
  withServerMarkup,
} from "../../../storybook/decorators/index.js";
import {
  STATUSES,
  StatusWords,
  TagWords,
} from "../../../storybook/words/index.js";
import Component from "./FilterOptions.js";

const meta = {
  title: "_work_in_progress/FilterOptions",
  component: Component,
  decorators: [withAppScope],
} satisfies Meta<typeof Component>;

export default meta;

/**
 * One value at a time: choosing a word makes it current, and "All" clears
 * the filter. Each count follows its word.
 */
export const Single: StoryFn = () => <StatusWords />;
Single.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  const ready = canvas.getByRole("button", { name: /^ready\s?,\s?4$/ });
  await userEvent.click(ready);
  await expect(ready).toHaveAttribute("aria-current", "true");
  await expect(canvas.getByRole("button", { name: "All" })).not.toHaveAttribute(
    "aria-current",
  );
};

/** Several values at once: each word toggles, and says it is pressed. */
export const Multiple: StoryFn = () => <TagWords />;
Multiple.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await userEvent.click(canvas.getByRole("button", { name: "ex-ssd" }));
  await expect(canvas.getByRole("button", { name: "ex-gpu" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(canvas.getByRole("button", { name: "ex-ssd" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
};

/** The current word stands out by weight as well as colour. */
export const Current: StoryFn = () => <StatusWords initial="deployed" />;

/**
 * With an address, each word is a link to the query with its condition set
 * or removed, so it works before scripts run.
 */
export const Links: StoryFn = () => (
  <Component
    label="Status"
    options={[
      { value: "All", label: "All", current: false, href: "?" },
      ...STATUSES.map(({ value, count }) => ({
        value,
        label: value,
        count,
        current: value === "deployed",
        href: `?status=${value}`,
      })),
    ]}
  />
);

/**
 * Before scripts run, with no address to lead to: the words are text, the
 * current one still marked, and they work once scripts run.
 */
export const Inert: StoryFn = () => <StatusWords initial="ready" />;
Inert.decorators = [withServerMarkup];
Inert.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await expect(canvas.queryAllByRole("button")).toHaveLength(0);
  await expect(canvas.queryAllByRole("link")).toHaveLength(0);
};

/**
 * While an exclusion applies, the name carries its words, "none of 1", and
 * the Exclusion mark, and the excluded value shows the mark too.
 */
export const Excluded: StoryFn = () => (
  <Component
    label="Status"
    condition="exclusion"
    appliedLabel="none of 1"
    options={[
      { value: "", label: "All", current: false, onSelect: () => undefined },
      ...STATUSES.map(({ value }) => ({
        value,
        label: value,
        current: false,
        ...(value === "broken" ? { excludedLabel: `${value}, excluded` } : {}),
        onSelect: () => undefined,
      })),
    ]}
  />
);
Excluded.play = async ({ canvasElement }) => {
  await expect(
    within(canvasElement).getByRole("group", { name: "Status, none of 1" }),
  ).toBeInTheDocument();
};

/** Right to left, the names stand on the right and the words wrap leftward. */
export const RightToLeft: StoryFn = () => (
  <Component.Grid>
    <StatusWords initial="deployed" />
    <TagWords />
  </Component.Grid>
);
RightToLeft.decorators = [withRightToLeft];
