import type { Meta, StoryFn } from "@storybook/react-vite";
import type { ReactElement } from "react";
import { useState } from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { withServerMarkup } from "../../../storybook/decorators.js";
import { QueryBuilder } from "../../../storybook/QueryBuilder/index.js";
import { QueryChip } from "../QueryChip/index.js";
import { QueryChips } from "../QueryChips/index.js";
import Component from "./QueryInput.js";
import type { QueryInputOption, QueryInputProps } from "./types.js";

const meta = {
  title: "_work_in_progress/QueryInput",
  component: Component,
  // The suggestions are a popover in the top layer, which escapes every
  // container, so each docs preview gets its own iframe.
  parameters: {
    docs: { story: { inline: false, iframeHeight: "420px" } },
  },
} satisfies Meta<typeof Component>;

export default meta;

const FIELDS: QueryInputOption[] = [
  { id: "status", label: "status", hint: "6 values", group: "fields" },
  { id: "pool", label: "pool", hint: "3 values", group: "fields" },
  { id: "owner", label: "owner", disabled: true, group: "fields" },
  { id: "tags", label: "tags", current: true, group: "fields" },
  { id: "cpu", label: "≥ cpu", name: "at least cpu", group: "ranges" },
];

/** The clauses a story starts on: a status, and a pool beside it. */
const DEPLOYED = "status=deployed";
const DEPLOYED_AND_GPU = "status=deployed&pool=gpu";

/** A host that holds the text and shows a fixed list of suggestions. */
const TextHost = (props: Partial<QueryInputProps>): ReactElement => {
  const [value, setValue] = useState("");
  return (
    <Component
      label="Filter machines"
      placeholder="Search or filter"
      {...(props as Record<string, unknown>)}
      value={value}
      onValueChange={setValue}
    />
  );
};

/** The field's own entry, by its name. */
const findEntry = (canvasElement: HTMLElement) =>
  within(canvasElement).getByRole("combobox", { name: "Filter machines" });

/**
 * The option with this name, in the suggestions' top-layer popover. Hidden
 * elements count, so the plays also run in jsdom, which hides every popover.
 */
const findOption = (canvasElement: HTMLElement, name: string | RegExp) =>
  within(canvasElement).findByRole("option", { hidden: true, name });

/**
 * Type a field's name and choose it: the field becomes a chip, and the chip's
 * own entry takes its operator.
 */
export const Default: StoryFn = () => <QueryBuilder />;
Default.play = async ({ canvasElement }) => {
  await userEvent.type(findEntry(canvasElement), "sta");
  await userEvent.click(await findOption(canvasElement, /^status/));
  const operator = within(canvasElement).getByRole("combobox", {
    name: "Operator for status",
  });
  await waitFor(() => expect(operator).toHaveFocus());
};

/** Choose a field, an operator and a value, and the chip is complete. */
export const BuildAChip: StoryFn = () => <QueryBuilder />;
BuildAChip.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await userEvent.type(findEntry(canvasElement), "status");
  // Enter with nothing highlighted chooses the field typed exactly.
  await userEvent.keyboard("{Enter}");
  await userEvent.click(await findOption(canvasElement, /^is any of/));
  await userEvent.click(await findOption(canvasElement, "deployed"));
  // A choice takes several values: Enter again applies them.
  await userEvent.keyboard("{Enter}");
  await waitFor(() =>
    expect(
      canvas.getByRole("group", { name: "status is deployed" }),
    ).toBeInTheDocument(),
  );
  await waitFor(() => expect(findEntry(canvasElement)).toHaveFocus());
};

/**
 * Activate a part of a chip to edit it: the Entry takes its place, a pick
 * replaces it, and Enter applies it.
 */
export const EditAChip: StoryFn = () => <QueryBuilder initial={DEPLOYED} />;
EditAChip.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await userEvent.click(canvas.getByRole("button", { name: "deployed" }));
  const part = await canvas.findByRole("combobox", {
    name: "Value for status",
  });
  await waitFor(() => expect(part).toHaveFocus());
  await userEvent.click(await findOption(canvasElement, "ready"));
  await userEvent.keyboard("{Enter}");
  await waitFor(() =>
    expect(
      canvas.getByRole("group", { name: "status is ready" }),
    ).toBeInTheDocument(),
  );
  await waitFor(() =>
    expect(canvas.getByRole("button", { name: "ready" })).toHaveFocus(),
  );
  // The list closes with the Entry it served.
  const suggestions = canvasElement.querySelector(
    ".query-input-suggestions",
  ) as Element;
  await waitFor(() => expect(suggestions.matches(":popover-open")).toBe(false));
};

/** Remove a chip with its remove control. */
export const RemoveAChip: StoryFn = () => (
  <QueryBuilder initial={DEPLOYED_AND_GPU} />
);
RemoveAChip.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await userEvent.click(
    canvas.getByRole("button", { name: "Remove status is deployed" }),
  );
  await waitFor(() =>
    expect(
      canvas.queryByRole("group", { name: "status is deployed" }),
    ).toBeNull(),
  );
  expect(
    canvas.getByRole("group", { name: "pool is gpu" }),
  ).toBeInTheDocument();
  // The stop moves to the chip before it, the last one left.
  await waitFor(() =>
    expect(canvas.getByRole("button", { name: "pool" })).toHaveAttribute(
      "tabindex",
      "0",
    ),
  );
};

/**
 * Removing another chip while one is being edited ends that edit: the
 * edited chip gets its clause back and takes the stop.
 */
export const RemoveAnotherChipMidEdit: StoryFn = () => (
  <QueryBuilder initial={DEPLOYED_AND_GPU} />
);
RemoveAnotherChipMidEdit.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await userEvent.click(canvas.getByRole("button", { name: "deployed" }));
  await canvas.findByRole("combobox", { name: "Value for status" });
  await userEvent.click(
    canvas.getByRole("button", { name: "Remove pool is gpu" }),
  );
  await waitFor(() =>
    expect(
      canvas.queryByRole("combobox", { name: "Value for status" }),
    ).toBeNull(),
  );
  expect(
    canvas.getByRole("group", { name: "status is deployed" }),
  ).toBeInTheDocument();
  expect(canvas.queryByRole("group", { name: "pool is gpu" })).toBeNull();
};

/** Clear every chip and the text at once. */
export const Clear: StoryFn = () => <QueryBuilder initial={DEPLOYED_AND_GPU} />;
Clear.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await userEvent.click(
    canvas.getByRole("button", { name: "Clear filters and search" }),
  );
  await waitFor(() => expect(canvas.queryByRole("list")).toBeNull());
  await waitFor(() => expect(findEntry(canvasElement)).toHaveFocus());
};

/**
 * Everything by keyboard: Tab into the field, build a chip with the arrows
 * and Enter, move onto it with the left arrow, edit its value with Enter and
 * Tab, and remove it with Delete.
 */
export const KeyboardOnly: StoryFn = () => <QueryBuilder />;
KeyboardOnly.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  const entry = findEntry(canvasElement);
  const findPoolChip = () => canvas.getByRole("button", { name: "pool" });
  await userEvent.tab();
  await waitFor(() => expect(entry).toHaveFocus());
  await userEvent.keyboard("pool");
  await userEvent.keyboard("{ArrowDown}{Enter}");
  const operator = await canvas.findByRole("combobox", {
    name: "Operator for pool",
  });
  await waitFor(() => expect(operator).toHaveFocus());
  await userEvent.keyboard("{ArrowDown}{Enter}");
  const value = await canvas.findByRole("combobox", { name: "Value for pool" });
  await waitFor(() => expect(value).toHaveFocus());
  // The value joins the chip, and Enter again applies it.
  await userEvent.keyboard("{ArrowDown}{Enter}{Enter}");
  await waitFor(() => expect(entry).toHaveFocus());
  expect(
    canvas.getByRole("group", { name: "pool is default" }),
  ).toBeInTheDocument();
  await userEvent.keyboard("{ArrowLeft}");
  await waitFor(() => expect(findPoolChip()).toHaveFocus());
  await userEvent.keyboard("{Enter}");
  const field = await canvas.findByRole("combobox", { name: "Field" });
  await waitFor(() => expect(field).toHaveFocus());
  await userEvent.keyboard("{Tab}{Tab}");
  const edited = await canvas.findByRole("combobox", {
    name: "Value for pool",
  });
  await waitFor(() => expect(edited).toHaveFocus());
  // A pick replaces the held value.
  await userEvent.keyboard("{ArrowDown}{ArrowDown}{Enter}{Enter}");
  await waitFor(() =>
    expect(
      canvas.getByRole("group", { name: "pool is gpu" }),
    ).toBeInTheDocument(),
  );
  // Focus returns to the part that was edited.
  await waitFor(() =>
    expect(canvas.getByRole("button", { name: "gpu" })).toHaveFocus(),
  );
  // The right arrow moves back to the entry, Backspace in it to the last
  // chip, and Delete removes that.
  await userEvent.keyboard("{ArrowRight}");
  await waitFor(() => expect(entry).toHaveFocus());
  await userEvent.keyboard("{Backspace}");
  await waitFor(() => expect(findPoolChip()).toHaveFocus());
  await userEvent.keyboard("{Delete}");
  await waitFor(() => expect(canvas.queryByRole("list")).toBeNull());
  await waitFor(() => expect(entry).toHaveFocus());
};

/** Escape, once the list is closed, drops a draft, and focus returns to the entry. */
export const AbandonADraft: StoryFn = () => <QueryBuilder />;
AbandonADraft.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await userEvent.type(findEntry(canvasElement), "sta");
  await userEvent.click(await findOption(canvasElement, /^status/));
  await canvas.findByRole("combobox", { name: "Operator for status" });
  await userEvent.keyboard("{Escape}{Escape}");
  await waitFor(() => expect(canvas.queryByRole("group")).toBeNull());
  await waitFor(() => expect(findEntry(canvasElement)).toHaveFocus());
};

/**
 * Escape cancels an edit: a chip whose field was changed gets its clause
 * back, and focus returns to the part the Entry was on.
 */
export const CancelAnEdit: StoryFn = () => <QueryBuilder initial={DEPLOYED} />;
CancelAnEdit.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await userEvent.click(canvas.getByRole("button", { name: "status" }));
  await canvas.findByRole("combobox", { name: "Field" });
  await userEvent.click(await findOption(canvasElement, /^pool/));
  // The Entry moves to the value, and keeps focus as it moves.
  const value = await canvas.findByRole("combobox", { name: "Value for pool" });
  await waitFor(() => expect(value).toHaveFocus());
  await userEvent.keyboard("{Escape}{Escape}");
  await waitFor(() =>
    expect(
      canvas.getByRole("group", { name: "status is deployed" }),
    ).toBeInTheDocument(),
  );
  await waitFor(() =>
    expect(canvas.getByRole("button", { name: "deployed" })).toHaveFocus(),
  );
};

/**
 * Moving to the free-text entry mid-draft drops the draft, and the entry
 * offers fields again.
 */
export const LeaveADraft: StoryFn = () => <QueryBuilder />;
LeaveADraft.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  const entry = findEntry(canvasElement);
  await userEvent.type(entry, "sta");
  await userEvent.click(await findOption(canvasElement, /^status/));
  await canvas.findByRole("combobox", { name: "Operator for status" });
  await userEvent.click(entry);
  await waitFor(() => expect(canvas.queryByRole("group")).toBeNull());
  await expect(await findOption(canvasElement, /^pool/)).toBeInTheDocument();
};

/**
 * Tab writes what is typed into each part, and past a draft's last part
 * commits the chip: focus returns to the entry, and the next Tab leaves the
 * field. Shift+Tab from a draft's operator returns its field to the entry,
 * as text: a chip keeps one Segment.
 */
export const TabOutOfADraft: StoryFn = () => <QueryBuilder />;
TabOutOfADraft.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await userEvent.type(findEntry(canvasElement), "status");
  await userEvent.keyboard("{Enter}");
  const operator = await canvas.findByRole("combobox", {
    name: "Operator for status",
  });
  await waitFor(() => expect(operator).toHaveFocus());
  await userEvent.keyboard("{Shift>}{Tab}{/Shift}");
  await waitFor(() => expect(findEntry(canvasElement)).toHaveFocus());
  expect(findEntry(canvasElement)).toHaveValue("status");
  expect(canvas.queryByRole("group")).toBeNull();
  await userEvent.keyboard("{Enter}");
  await waitFor(() =>
    expect(
      canvas.getByRole("combobox", { name: "Operator for status" }),
    ).toHaveFocus(),
  );
  // A typed `:` settles the operator and moves on to the value.
  await userEvent.keyboard(":");
  const value = await canvas.findByRole("combobox", {
    name: "Value for status",
  });
  await waitFor(() => expect(value).toHaveFocus());
  await userEvent.keyboard("ready{Tab}");
  await waitFor(() =>
    expect(
      canvas.getByRole("group", { name: "status is ready" }),
    ).toBeInTheDocument(),
  );
  await waitFor(() => expect(findEntry(canvasElement)).toHaveFocus());
};

/**
 * Focus leaving the field commits an edit, with a value typed exactly in
 * place of the one it held, and leaves focus where it went.
 */
export const EndEditOnBlur: StoryFn = () => (
  <div style={{ display: "grid", gap: "var(--dimension-200)" }}>
    <QueryBuilder initial={DEPLOYED} />
    <button type="button">Elsewhere</button>
  </div>
);
EndEditOnBlur.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await userEvent.click(canvas.getByRole("button", { name: "deployed" }));
  const value = await canvas.findByRole("combobox", {
    name: "Value for status",
  });
  await waitFor(() => expect(value).toHaveFocus());
  await userEvent.keyboard("ready");
  const elsewhere = canvas.getByRole("button", { name: "Elsewhere" });
  await userEvent.click(elsewhere);
  await waitFor(() =>
    expect(
      canvas.queryByRole("combobox", { name: "Value for status" }),
    ).toBeNull(),
  );
  expect(
    canvas.getByRole("group", { name: "status is ready" }),
  ).toBeInTheDocument();
  expect(elsewhere).toHaveFocus();
};

/**
 * Focus leaving for the page itself, as a press on its background does,
 * commits an edit, or drops a draft still incomplete, and focus stays on
 * the page.
 */
export const LeaveToThePage: StoryFn = () => (
  <QueryBuilder initial={DEPLOYED} />
);
LeaveToThePage.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  const leaveToThePage = async () => {
    (document.activeElement as HTMLElement | null)?.blur();
    await userEvent.pointer({ keys: "[MouseLeft]", target: document.body });
    await new Promise((resolve) => setTimeout(resolve, 50));
    await expect(document.body).toHaveFocus();
  };
  await userEvent.click(canvas.getByRole("button", { name: "deployed" }));
  const value = await canvas.findByRole("combobox", {
    name: "Value for status",
  });
  await waitFor(() => expect(value).toHaveFocus());
  await userEvent.keyboard("ready");
  await leaveToThePage();
  expect(
    canvas.queryByRole("combobox", { name: "Value for status" }),
  ).toBeNull();
  expect(
    canvas.getByRole("group", { name: "status is ready" }),
  ).toBeInTheDocument();
  await userEvent.click(findEntry(canvasElement));
  await userEvent.keyboard("pool{Enter}");
  await canvas.findByRole("combobox", { name: "Operator for pool" });
  await leaveToThePage();
  expect(canvas.queryByRole("group", { name: "pool" })).toBeNull();
  expect(findEntry(canvasElement)).toHaveAttribute("aria-expanded", "false");
};

/** Grouped suggestions with hints, a disabled option and the current one. */
export const Suggestions: StoryFn = () => <TextHost options={FIELDS} />;
Suggestions.play = async ({ canvasElement }) => {
  await userEvent.click(findEntry(canvasElement));
  await userEvent.keyboard("{ArrowDown}");
  await expect(findEntry(canvasElement)).toHaveAttribute(
    "aria-activedescendant",
    expect.stringMatching(/./),
  );
};

/** Opens the suggestions by focusing the entry. */
const openSuggestions = async ({
  canvasElement,
}: {
  canvasElement: HTMLElement;
}) => {
  await userEvent.click(findEntry(canvasElement));
  await expect(findEntry(canvasElement)).toHaveAttribute(
    "aria-expanded",
    "true",
  );
};

/** While suggestions load, a spinner shows, and the status region says so once. */
export const Loading: StoryFn = () => (
  <TextHost loading loadingLabel="Loading suggestions" />
);
Loading.play = openSuggestions;

/** With nothing to suggest, the empty text and a footer hint. */
export const Empty: StoryFn = () => (
  <TextHost
    emptyText="No matching fields"
    footer="Separate multiple values with commas"
  />
);
Empty.play = openSuggestions;

/** The field and its clear control disabled. */
export const Disabled: StoryFn = () => (
  <Component
    label="Filter machines"
    value=""
    onValueChange={() => {}}
    hiddenLabel={(count) => `+${count} more`}
    onClear={() => {}}
    clearLabel="Clear filters and search"
    disabled
  >
    <QueryChips label="Filters">
      <QueryChip
        id="clause-1"
        label="status is deployed"
        disabled
        onRemove={() => {}}
        removeLabel="Remove status is deployed"
      >
        <QueryChip.Segment onActivate={() => {}}>status</QueryChip.Segment>
        <QueryChip.Segment onActivate={() => {}} condition="inclusion">
          is
        </QueryChip.Segment>
        <QueryChip.Segment onActivate={() => {}}>deployed</QueryChip.Segment>
      </QueryChip>
    </QueryChips>
  </Component>
);
Disabled.play = async ({ canvasElement }) => {
  // The entry, every chip's parts and both controls are disabled.
  const controls = canvasElement.querySelectorAll<HTMLButtonElement>(
    ".field button, .field input",
  );
  await expect(controls.length).toBeGreaterThan(0);
  for (const control of controls) await expect(control).toBeDisabled();
};

/**
 * Unfocused, the field holds one line, fades its end and shows the words for
 * the chips that do not fit; focused, it wraps over what follows.
 */
export const HiddenChips: StoryFn = () => (
  <div>
    <QueryBuilder
      inlineSize="24rem"
      initial="status=deployed&pool=gpu&owner=alice&status__isNone=broken"
    />
    <p>Content after the field, which the focused field overlays.</p>
  </div>
);
HiddenChips.play = async ({ canvasElement }) => {
  const field = canvasElement.querySelector(".field") as HTMLElement;
  const row = field.getBoundingClientRect();
  // Only a browser lays the field out; jsdom gives every box no size.
  if (row.width === 0) return;
  const entry = findEntry(canvasElement).getBoundingClientRect();
  await expect(entry.width).toBeGreaterThanOrEqual(24);
  await expect(entry.right).toBeLessThanOrEqual(row.right);
  await expect(canvasElement.querySelector(".hidden-count")).not.toBeNull();
};

/**
 * At the bottom of the viewport the suggestions open above the entry, where
 * there is room.
 */
export const AtTheBottom: StoryFn = () => (
  <div
    style={{
      display: "grid",
      alignContent: "end",
      minBlockSize: "calc(100dvh - 2 * var(--dimension-300))",
    }}
  >
    <QueryBuilder />
  </div>
);
AtTheBottom.play = async ({ canvasElement }) => {
  const entry = findEntry(canvasElement);
  await userEvent.click(entry);
  const list = await within(canvasElement).findByRole("listbox", {
    hidden: true,
  });
  const box = list.getBoundingClientRect();
  // Only a browser lays the list out; jsdom gives every box no size.
  if (box.height === 0) return;
  await expect(box.bottom).toBeLessThanOrEqual(
    entry.getBoundingClientRect().top,
  );
};

/** On a Surface1 page, the suggestions sit at Surface2. */
export const OnASurface: StoryFn = () => (
  <div
    className="surface"
    style={{
      padding: "var(--dimension-300)",
      background: "var(--surface-color-background)",
    }}
  >
    <QueryBuilder />
  </div>
);

/** Density comes from the scope. */
export const Density: StoryFn = () => (
  <div style={{ display: "grid", gap: "var(--dimension-300)" }}>
    {["comfortable", "dense"].map((density) => (
      <div key={density} className={density}>
        <QueryBuilder initial={DEPLOYED} />
      </div>
    ))}
  </div>
);

/**
 * As the server sends it, for a host that can spell addresses: a plain
 * search input in its GET form, with no toolbar, combobox or suggestions.
 */
export const WithoutScripts: StoryFn = () => (
  <form method="get">
    <TextHost name="q" clearHref="?" clearLabel="Clear filters and search" />
  </form>
);
WithoutScripts.decorators = [withServerMarkup];

/**
 * As the server sends it, without a `name` or `clearHref`, as under an
 * in-memory query state: the entry and the clear button are inert until
 * scripts run.
 */
export const WithoutAddresses: StoryFn = () => (
  <TextHost onClear={() => {}} clearLabel="Clear filters and search" />
);
WithoutAddresses.decorators = [withServerMarkup];
