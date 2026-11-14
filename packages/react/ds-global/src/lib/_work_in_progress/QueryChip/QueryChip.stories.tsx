import { MODIFIER_FAMILIES } from "@canonical/ds-types";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  type CSSProperties,
  type KeyboardEvent,
  type ReactElement,
  type ReactNode,
  useState,
} from "react";
import { renderToString } from "react-dom/server";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import * as decorators from "../../../storybook/decorators.js";
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
 * Hosts its chips in one roving toolbar, as a query input does: the arrow
 * keys move the tab stop across every enabled part, in document order.
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
    ].map((item) => item.dataset.rovingItem ?? "");
    const next = items.at(
      (items.indexOf(activeItem) + step + items.length) % items.length,
    );
    if (next) setActiveItem(next);
  };
  return (
    // biome-ignore lint/a11y/useSemanticElements: a toolbar has no native element
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
const DraftChip = ({ id, children }: { id: string; children?: ReactNode }) => {
  const [value, setValue] = useState("");
  return (
    <Component id={id} label="status">
      {children}
      <Entry
        value={value}
        onValueChange={setValue}
        label="Operator and value for status"
        placeholder="is, is not, contains…"
      />
    </Component>
  );
};

/** Shows the markup a server sends, which no script ever runs over. */
const ServerMarkup = ({ children }: { children: ReactElement }) => (
  <div
    // biome-ignore lint/security/noDangerouslySetInnerHtml: the story's own server markup, rendered from its own element
    dangerouslySetInnerHTML={{ __html: renderToString(children) }}
  />
);

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
      options: [undefined, ...MODIFIER_FAMILIES.criticality],
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
 * Exclusion's tone differs from the others.
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
      <DraftChip id="draft">
        <Segment onActivate={fn()}>status</Segment>
      </DraftChip>
    </Toolbar>
  ),
};

/** An edited chip: the value segment is swapped for an entry. */
export const Edited: Story = {
  render: () => {
    const EditedChip = () => {
      const [value, setValue] = useState("deployed, ready");
      return (
        <Component id="edited" label="status is any of">
          <Segment onActivate={fn()}>status</Segment>
          <Segment condition="inclusion" onActivate={fn()}>
            is any of
          </Segment>
          <Entry
            value={value}
            onValueChange={setValue}
            label="Value for status is any of"
          />
        </Component>
      );
    };
    return (
      <Toolbar initial="edited:entry">
        <EditedChip />
      </Toolbar>
    );
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
        <Toolbar key={unity} initial={`${unity}-selected:remove`}>
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
    // Focus on a segment selects the first chip.
    const [status] = await within(canvasElement).findAllByRole("button", {
      name: "status",
    });
    status?.focus();
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

/** The host's arrow keys move the tab stop across the chips' parts. */
export const InRovingContext: Story = {
  render: () => (
    <Toolbar initial="status:remove">
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
      <DraftChip id="draft">
        <Segment onActivate={fn()}>cpu</Segment>
      </DraftChip>
    </Toolbar>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const remove = await canvas.findByRole("button", {
      name: "Remove status is any of deployed, ready",
    });
    // The parts become roving items once the chip has mounted.
    await waitFor(() => expect(remove).toBeEnabled());
    await userEvent.tab();
    await expect(remove).toHaveFocus();
    await userEvent.keyboard("{ArrowRight}");
    await expect(canvas.getByRole("button", { name: "cpu" })).toHaveFocus();
    await userEvent.keyboard("{ArrowRight}");
    await expect(canvas.getByRole("textbox")).toHaveFocus();
    await userEvent.keyboard("{ArrowLeft}{ArrowLeft}");
    await expect(remove).toHaveFocus();
  },
};

/** In a right-to-left context, the parts and the remove control mirror. */
export const RTL: Story = {
  decorators: [decorators.rtl()],
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
 * The markup a server sends before any script runs: plain-text segments, a
 * plain text entry, a remove link where the host gives an address, and an
 * inert remove button where it does not.
 */
export const WithoutScripts: Story = {
  render: () => (
    <ServerMarkup>
      <div style={column}>
        <Component
          removeHref="?"
          removeLabel="Remove status is any of deployed, ready"
        >
          {clause}
        </Component>
        <Component
          unity="joined"
          onRemove={() => {}}
          removeLabel="Remove status"
        >
          <Segment>status</Segment>
          <Entry value="" onValueChange={() => {}} label="Value for status" />
        </Component>
      </div>
    </ServerMarkup>
  ),
};
