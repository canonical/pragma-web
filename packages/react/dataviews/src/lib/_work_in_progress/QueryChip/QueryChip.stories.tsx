import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
  useState,
} from "react";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import {
  withRightToLeft,
  withServerMarkup,
} from "../../../storybook/decorators/index.js";
import { RovingProvider } from "../../common/Roving/index.js";
import Component from "./QueryChip.js";

const { Segment, Entry } = Component;

const row = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  gap: "var(--dimension-200)",
} as const;

const column = {
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  gap: "var(--dimension-200)",
} as const;

/** Whether an arrow key should move the caret of an input, not the stop. */
const isCaretMove = (event: KeyboardEvent): boolean => {
  const target = event.target;
  if (!(target instanceof HTMLInputElement)) return false;
  return event.key === "ArrowLeft"
    ? (target.selectionStart ?? 0) > 0
    : (target.selectionEnd ?? 0) < target.value.length;
};

/**
 * Hosts its chips in one roving toolbar, as a query input does: each chip is
 * one item, its first Segment or its Entry, and the arrow keys move the tab
 * stop from chip to chip in document order.
 */
const Toolbar = ({
  initial,
  children,
}: {
  initial: string;
  children: ReactNode;
}) => {
  const [activeItem, setActiveItem] = useState(initial);
  const moveStop = (event: KeyboardEvent<HTMLDivElement>) => {
    const step = { ArrowRight: 1, ArrowLeft: -1 }[event.key];
    if (step === undefined || isCaretMove(event)) return;
    event.preventDefault();
    const items = [
      ...event.currentTarget.querySelectorAll<HTMLElement>(
        "[data-roving-item]:not(:disabled)",
      ),
    ].map((item) => item.dataset["rovingItem"] ?? "");
    const next = items.at(
      (items.indexOf(activeItem) + step + items.length) % items.length,
    );
    if (next) setActiveItem(next);
  };
  return (
    <div role="toolbar" aria-label="Query" style={row} onKeyDown={moveStop}>
      <RovingProvider
        activeItem={activeItem}
        onActiveItemChange={setActiveItem}
      >
        {children}
      </RovingProvider>
    </div>
  );
};

/** A chip whose entry holds what is typed. */
const DraftChip = ({
  id,
  field,
  children,
}: {
  id: string;
  field: string;
  children?: ReactNode;
}) => {
  const [value, setValue] = useState("");
  return (
    <Component id={id} label={field}>
      {children}
      <Entry
        value={value}
        onValueChange={setValue}
        label={`Operator and value for ${field}`}
        placeholder="is, is not, contains…"
      />
    </Component>
  );
};

const clause = (
  <>
    <Segment>status</Segment>
    <Segment condition="inclusion">is any of</Segment>
    <Segment>deployed, ready</Segment>
  </>
);

const meta = {
  title: "_work_in_progress/QueryChip",
  component: Component,
  argTypes: {
    criticality: {
      options: [undefined, "error", "warning", "success", "information"],
      control: { type: "radio" },
    },
    unity: {
      options: ["separated", "joined"],
      control: { type: "radio" },
    },
  },
  args: {
    children: clause,
  },
} satisfies Meta<typeof Component>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A clause of field, operator and value, read-only. */
export const Default: Story = {};

/**
 * Each Condition value on the operator segment, with its tone and its mark.
 * Exclusion takes a negation tone of its own, apart from the other values'
 * and from every Criticality value.
 */
export const Operators: Story = {
  render: () => (
    <div style={column}>
      <Component>{clause}</Component>
      <Component>
        <Segment>status</Segment>
        <Segment condition="exclusion">is not</Segment>
        <Segment>failed</Segment>
      </Component>
      <Component>
        <Segment>hostname</Segment>
        <Segment condition="match">contains</Segment>
        <Segment>web</Segment>
      </Component>
      <Component>
        <Segment>cpu</Segment>
        <Segment condition="range">between</Segment>
        <Segment>4 and 16</Segment>
      </Component>
      <Component>
        <Segment>owner</Segment>
        <Segment condition="presence">is set</Segment>
      </Component>
    </div>
  ),
};

/** A draft chip: its field is chosen, and its entry takes the rest. */
export const Draft: Story = {
  render: () => (
    <Toolbar initial="draft:entry">
      <DraftChip id="draft" field="status">
        <Segment onActivate={fn()}>status</Segment>
      </DraftChip>
    </Toolbar>
  ),
};

/**
 * An Entry with a format template, whose untyped rest shows behind and after
 * what is typed, and a suffix. The template sizes the part, so it is never
 * cut off.
 */
export const Formatted: Story = {
  render: () => {
    const FormattedChip = () => {
      const [value, setValue] = useState("2026-1");
      return (
        <Component id="formatted" label="created after">
          <Segment onActivate={fn()}>created</Segment>
          <Segment condition="range" onActivate={fn()}>
            after
          </Segment>
          <Entry
            value={value}
            onValueChange={setValue}
            label="Date for created after"
            template="YYYY-MM-DD"
            formatDescription="Date, format YYYY-MM-DD"
            suffix="UTC"
          />
        </Component>
      );
    };
    return (
      <Toolbar initial="formatted:entry">
        <FormattedChip />
      </Toolbar>
    );
  },
  play: async ({ canvasElement }) => {
    const template = await waitFor(() => {
      const element = canvasElement.querySelector(".template");
      if (!element) throw new Error("No template yet.");
      return element;
    });
    // The whole template shows inside its part, before the suffix.
    const box = template.getBoundingClientRect();
    const entry = template.parentElement?.getBoundingClientRect();
    const suffix = canvasElement
      .querySelector(".suffix")
      ?.getBoundingClientRect();
    const body = canvasElement.querySelector(".body");
    await expect(entry?.left ?? Number.NaN).toBeLessThanOrEqual(box.left);
    await expect(box.right).toBeLessThanOrEqual(suffix?.left ?? Number.NaN);
    await expect(box.right).toBeLessThanOrEqual(entry?.right ?? Number.NaN);
    // The body clips nothing.
    await expect(body?.scrollWidth).toBe(body?.clientWidth);
  },
};

/**
 * An edited chip: activating its value swaps that Segment for an Entry,
 * which takes focus, and Enter swaps it back.
 */
export const Edited: Story = {
  render: () => {
    const EditedChip = () => {
      const [value, setValue] = useState("deployed, ready");
      const [activeItem, setActiveItem] = useState("edited");
      // The host edits a part by moving the stop onto the Entry it swaps in.
      const isEditing = activeItem === "edited:entry";
      return (
        <div role="toolbar" aria-label="Query" style={row}>
          <RovingProvider
            activeItem={activeItem}
            onActiveItemChange={setActiveItem}
          >
            <Component id="edited" label={`status is any of ${value}`}>
              <Segment onActivate={fn()}>status</Segment>
              <Segment condition="inclusion" onActivate={fn()}>
                is any of
              </Segment>
              {isEditing ? (
                <Entry
                  value={value}
                  onValueChange={setValue}
                  label="Value for status is any of"
                  onKeyDown={(event) => {
                    if (event.key === "Enter") setActiveItem("edited");
                  }}
                />
              ) : (
                <Segment onActivate={() => setActiveItem("edited:entry")}>
                  {value}
                </Segment>
              )}
            </Component>
          </RovingProvider>
        </div>
      );
    };
    return <EditedChip />;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      await canvas.findByRole("button", { name: "deployed, ready" }),
    );
    await expect(canvas.getByRole("textbox")).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await expect(canvas.getByRole("button", { name: "status" })).toHaveFocus();
  },
};

/**
 * The versions of the chip: `separated`, the default, where the surface
 * shows between the parts; `joined`, where a 1 px line does and the chip is
 * one target; and a flat form, which is `separated` with its component
 * tokens remapped, not a value.
 */
export const Versions: Story = {
  render: () => (
    <div style={column}>
      <Component unity="separated">{clause}</Component>
      <Component unity="joined">{clause}</Component>
      <Component
        style={
          {
            "--query-chip-radius": "0",
            "--query-chip-segment-background": "transparent",
          } as CSSProperties
        }
      >
        {clause}
      </Component>
    </div>
  ),
};

/** Selected, invalid, refused and disabled, in a toolbar, for each unity. */
export const States: Story = {
  render: () => (
    <div style={column}>
      {(["separated", "joined"] as const).map((unity) => (
        <Toolbar key={unity} initial={`${unity}-selected`}>
          <Component
            id={`${unity}-selected`}
            unity={unity}
            label="status is any of deployed, ready"
          >
            <Segment onActivate={fn()}>status</Segment>
            <Segment condition="inclusion" onActivate={fn()}>
              is any of
            </Segment>
            <Segment onActivate={fn()}>deployed, ready</Segment>
          </Component>
          <Component
            id={`${unity}-invalid`}
            unity={unity}
            label="status is deploying"
          >
            <Segment onActivate={fn()}>status</Segment>
            <Segment condition="inclusion" onActivate={fn()}>
              is
            </Segment>
            <Segment
              invalid
              description="Invalid: no such status"
              onActivate={fn()}
            >
              deploying
            </Segment>
          </Component>
          <Component
            id={`${unity}-refused`}
            unity={unity}
            criticality="error"
            label="cpu is 4"
          >
            <Segment
              description="Refused: the source cannot filter on cpu"
              onActivate={fn()}
            >
              cpu
            </Segment>
            <Segment onActivate={fn()}>is</Segment>
            <Segment onActivate={fn()}>4</Segment>
          </Component>
          <Component
            id={`${unity}-disabled`}
            unity={unity}
            disabled
            label="status is any of deployed, ready"
          >
            <Segment onActivate={fn()}>status</Segment>
            <Segment condition="inclusion" onActivate={fn()}>
              is any of
            </Segment>
            <Segment onActivate={fn()}>deployed, ready</Segment>
          </Component>
        </Toolbar>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    // Focus on a Segment selects the first chip.
    const [status] = await within(canvasElement).findAllByRole("button", {
      name: "status",
    });
    await userEvent.tab();
    await expect(status).toHaveFocus();
  },
};

/** A remove control: a button, or a link that works before scripts run. */
export const Removable: Story = {
  render: () => (
    <div style={row}>
      <Component
        onRemove={fn()}
        removeLabel="Remove status is any of deployed, ready"
      >
        {clause}
      </Component>
      <Component
        removeHref="?"
        removeLabel="Remove status is any of deployed, ready"
      >
        {clause}
      </Component>
    </div>
  ),
};

/**
 * The host's arrow keys move the tab stop from chip to chip: onto each
 * chip's first Segment, or onto its Entry while it holds one.
 */
export const InRovingContext: Story = {
  render: () => (
    <Toolbar initial="status">
      <Component
        id="status"
        label="status is any of deployed, ready"
        onRemove={fn()}
        removeLabel="Remove status is any of deployed, ready"
      >
        <Segment onActivate={fn()}>status</Segment>
        <Segment condition="inclusion" onActivate={fn()}>
          is any of
        </Segment>
        <Segment onActivate={fn()}>deployed, ready</Segment>
      </Component>
      <DraftChip id="draft" field="cpu">
        <Segment onActivate={fn()}>cpu</Segment>
      </DraftChip>
    </Toolbar>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // The parts become buttons once the chip has mounted.
    const status = await canvas.findByRole("button", { name: "status" });
    await expect(status).toHaveAttribute("tabindex", "0");
    for (const name of [
      "is any of",
      "deployed, ready",
      "Remove status is any of deployed, ready",
      "cpu",
    ]) {
      await expect(canvas.getByRole("button", { name })).toHaveAttribute(
        "tabindex",
        "-1",
      );
    }
    await userEvent.tab();
    await expect(status).toHaveFocus();
    await userEvent.keyboard("{ArrowRight}");
    await expect(canvas.getByRole("textbox")).toHaveFocus();
    await userEvent.keyboard("{ArrowLeft}");
    await expect(status).toHaveFocus();
  },
};

/** In a right-to-left context, the parts and the remove control mirror. */
export const RTL: Story = {
  decorators: [withRightToLeft],
  args: {
    children: (
      <>
        <Segment>الحالة</Segment>
        <Segment condition="inclusion">هي</Segment>
        <Segment>منشور</Segment>
      </>
    ),
    onRemove: fn(),
    removeLabel: "إزالة",
  },
};

/**
 * The markup a server sends before any script runs: plain-text segments, no
 * entry, a remove link where the host gives an address, and an inert remove
 * button where it does not.
 */
export const WithoutScripts: Story = {
  decorators: [withServerMarkup],
  render: () => (
    <div style={column}>
      <Component
        removeHref="?"
        removeLabel="Remove status is any of deployed, ready"
      >
        {clause}
      </Component>
      <RovingProvider activeItem="draft:entry" onActiveItemChange={() => {}}>
        <Component
          id="draft"
          unity="joined"
          label="status"
          onRemove={() => {}}
          removeLabel="Remove status"
        >
          <Segment onActivate={() => {}}>status</Segment>
          <Entry value="" onValueChange={() => {}} label="Value for status" />
        </Component>
      </RovingProvider>
    </div>
  ),
};
