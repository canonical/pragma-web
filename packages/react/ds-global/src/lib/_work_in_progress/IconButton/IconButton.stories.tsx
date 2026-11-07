import { ICON_NAMES } from "@canonical/ds-assets";
import { MODIFIER_FAMILIES } from "@canonical/ds-types";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { type ReactElement, type ReactNode, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import surface from "../../../storybook/decorators/surface.js";
import { Button } from "../../component/Button/index.js";
import { TooltipEngine, withTooltip } from "../../component/Tooltip/index.js";
import Component from "./IconButton.js";
import type { IconButtonProps } from "./types.js";

/** Tooltips portal to the body, so the docs render each story in an iframe. */
const tooltipParameters = {
  docs: { story: { inline: false, iframeHeight: "240px" } },
} as const;

/** An icon button with a Tooltip composed around it. */
function PairedIconButton(props: IconButtonProps): ReactElement {
  return (
    <TooltipEngine Message={props["aria-label"]}>
      <Component {...props} />
    </TooltipEngine>
  );
}

const meta = {
  title: "_work_in_progress/IconButton",
  component: Component,
  decorators: [surface()],
  // Every story pairs the icon button with a Tooltip.
  render: (args) => <PairedIconButton {...args} />,
  parameters: tooltipParameters,
  argTypes: {
    importance: {
      control: "select",
      options: [...MODIFIER_FAMILIES.importance],
    },
    anticipation: {
      control: "select",
      options: [undefined, ...MODIFIER_FAMILIES.anticipation],
    },
    icon: {
      control: "select",
      options: [...ICON_NAMES],
    },
  },
  args: {
    onClick: fn(),
    importance: "primary",
    icon: "edit",
    "aria-label": "Edit",
  },
} satisfies Meta<typeof Component>;

export default meta;
type Story = StoryObj<typeof meta>;

const row = {
  display: "flex",
  alignItems: "baseline",
  gap: "var(--dimension-200)",
} as const;

/** Layout is compared to a hundredth of a pixel. */
const TOLERANCE = 0.01;

/** The first match for `selector` under `parent`; throws when there is none. */
const findRequiredElement = (parent: ParentNode, selector: string): Element => {
  const element = parent.querySelector(selector);
  if (!element) throw new Error(`No element matches "${selector}".`);
  return element;
};

/** The border box of an element, in CSS pixels. */
const measureBox = (element: Element) => element.getBoundingClientRect();

/** Expects an icon button to be square with a centred icon; returns its box. */
const expectSquareCentredIconButton = async (iconButton: Element) => {
  const box = measureBox(iconButton);
  const icon = measureBox(findRequiredElement(iconButton, ".icon"));
  await expect(Math.abs(box.width - box.height)).toBeLessThan(TOLERANCE);
  await expect(
    Math.abs(icon.left + icon.width / 2 - (box.left + box.width / 2)),
  ).toBeLessThan(TOLERANCE);
  await expect(
    Math.abs(icon.top + icon.height / 2 - (box.top + box.height / 2)),
  ).toBeLessThan(TOLERANCE);
  return box;
};

/**
 * Expects every icon button in each geometry row to be square, centred, and
 * as tall as the row's labelled Button on the same top edge.
 */
const expectSquareSeatedIconButtons = async (canvasElement: HTMLElement) => {
  await canvasElement.ownerDocument.fonts.ready;
  const rows = [...canvasElement.querySelectorAll("[data-geometry-row]")];
  await expect(rows.length).toBeGreaterThan(0);
  for (const rowElement of rows) {
    const labelled = findRequiredElement(
      rowElement,
      "button:not(.icon-button)",
    );
    const iconButtons = [...rowElement.querySelectorAll("button.icon-button")];
    await expect(iconButtons.length).toBeGreaterThan(0);
    const reference = measureBox(labelled);
    for (const iconButton of iconButtons) {
      const box = await expectSquareCentredIconButton(iconButton);
      await expect(Math.abs(box.height - reference.height)).toBeLessThan(
        TOLERANCE,
      );
      await expect(Math.abs(box.top - reference.top)).toBeLessThan(TOLERANCE);
    }
  }
};

/** The default hierarchy: a filled primary icon button. */
export const Primary: Story = {
  args: { importance: "primary" },
};

/** The outlined importance. */
export const Secondary: Story = {
  args: { importance: "secondary" },
};

/** The borderless importance, the usual one for icon buttons. */
export const Tertiary: Story = {
  args: { importance: "tertiary" },
};

/** A spinner replaces the icon while the action runs; the size holds. */
export const Loading: Story = {
  args: { loading: true, "aria-label": "Saving" },
  render: (args) => (
    <div style={row}>
      <PairedIconButton {...args} />
      <PairedIconButton {...args} loading={false} aria-label="Save" />
    </div>
  ),
  play: async ({ canvas }) => {
    const loading = canvas.getByRole("button", { name: "Saving" });
    const idle = canvas.getByRole("button", { name: "Save" });
    const loadingBox = measureBox(loading);
    const idleBox = measureBox(idle);
    await expect(loading).toHaveAttribute("aria-busy", "true");
    await expect(Math.abs(loadingBox.width - idleBox.width)).toBeLessThan(
      TOLERANCE,
    );
    await expect(Math.abs(loadingBox.height - idleBox.height)).toBeLessThan(
      TOLERANCE,
    );
  },
};

/** The action is unavailable. */
export const Disabled: Story = {
  args: { disabled: true },
};

/** Icon buttons share the baseline of text and a labelled Button. */
export const BaselineAlignment: Story = {
  name: "Baseline alignment",
  parameters: { baseline: true },
  render: (args) => (
    <div style={{ display: "grid", gap: "var(--dimension-400)" }}>
      {(["comfortable", "dense"] as const).map((density) => (
        <div
          key={density}
          className={`app ${density}`}
          style={row}
          data-geometry-row
        >
          <span style={{ whiteSpace: "nowrap" }}>Instance name</span>
          <PairedIconButton {...args} importance="tertiary" />
          <PairedIconButton {...args} importance="secondary" />
          <PairedIconButton {...args} importance="primary" />
          <Button importance="secondary">Rename</Button>
        </div>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    await expectSquareSeatedIconButtons(canvasElement);
  },
};

/** The open Tooltip, anywhere in the document. */
const findOpenTooltip = (canvasElement: HTMLElement) =>
  within(canvasElement.ownerDocument.body).findByRole("tooltip");

/** An icon button wrapped with a fixed Tooltip message. */
const EditButtonWithTooltip = withTooltip(Component, "Edit");

/**
 * Always pair an icon button with a Tooltip. The other stories compose
 * `TooltipEngine`; this one uses `withTooltip`, for a fixed message.
 */
export const WithTooltip: Story = {
  name: "With Tooltip",
  args: { importance: "tertiary" },
  render: (args) => <EditButtonWithTooltip {...args} />,
  play: async ({ canvas, canvasElement }) => {
    const button = canvas.getByRole("button", { name: "Edit" });
    await userEvent.tab();
    await expect(button).toHaveFocus();
    await expect(await findOpenTooltip(canvasElement)).toHaveTextContent(
      "Edit",
    );
  },
};

/** Anticipation recolours the icon button as it does a Button. */
export const Anticipation: Story = {
  render: (args) => (
    <div style={{ display: "grid", gap: "var(--dimension-200)" }}>
      {(["destructive", "constructive"] as const).map((anticipation) => (
        <div key={anticipation} style={row}>
          {MODIFIER_FAMILIES.importance.map((importance) => (
            <PairedIconButton
              key={importance}
              {...args}
              importance={importance}
              anticipation={anticipation}
              icon={anticipation === "destructive" ? "delete" : "plus"}
              aria-label={anticipation === "destructive" ? "Delete" : "Add"}
            />
          ))}
        </div>
      ))}
    </div>
  ),
};

/**
 * Every context and density: the box is the density cell, on the text's
 * baseline. The secondary button has no Tooltip: it is the geometry control.
 */
export const DensityAndContext: Story = {
  name: "Density and context",
  parameters: {
    baseline: true,
    // Six rows: taller than the shared docs iframe.
    docs: { story: { inline: false, iframeHeight: "480px" } },
  },
  render: (args) => (
    <div style={{ display: "grid", gap: "var(--dimension-400)" }}>
      {(["app", "site", "docs"] as const).flatMap((context) =>
        (["comfortable", "dense"] as const).map((density) => (
          <div
            key={`${context}-${density}`}
            className={`${context} ${density}`}
            style={row}
            data-geometry-row
          >
            <span style={{ whiteSpace: "nowrap" }}>
              {context}, {density}
            </span>
            <PairedIconButton {...args} importance="tertiary" />
            {/* Unpaired on purpose: the geometry control. */}
            <Component {...args} importance="secondary" />
            <PairedIconButton {...args} importance="primary" />
            <Button importance="secondary">Rename</Button>
          </div>
        )),
      )}
    </div>
  ),
  play: async ({ canvasElement }) => {
    await expectSquareSeatedIconButtons(canvasElement);
  },
};

/** The density and context classes. */
const SCOPES = ".comfortable, .dense, .app, .site, .docs";

/**
 * Test only: the row is portalled to the body, outside every density scope,
 * where the box must still be square. The first button has no Tooltip: it is
 * the geometry control.
 */
export const OutsideADensityScope: Story = {
  name: "Outside a density scope",
  tags: ["!dev", "!autodocs"],
  // Generated JSX cannot print a portal.
  parameters: {
    docs: {
      source: {
        type: "code",
        code: '<IconButton icon="edit" aria-label="Edit" importance="secondary" />',
      },
    },
  },
  render: function OutsideADensityScopeRender(args) {
    const [container, setContainer] = useState<HTMLElement | null>(null);
    useEffect(() => {
      const element = document.createElement("div");
      element.dataset.outsideScope = "";
      document.body.append(element);
      setContainer(element);
      return () => element.remove();
    }, []);
    // A fragment: a story must return an element.
    return (
      <>
        {container
          ? createPortal(
              <div style={row}>
                <Component {...args} importance="secondary" />
                <TooltipEngine Message="Edit">
                  <Component {...args} importance="secondary" />
                </TooltipEngine>
              </div>,
              container,
            )
          : null}
      </>
    );
  },
  play: async ({ canvasElement }) => {
    const document = canvasElement.ownerDocument;
    await document.fonts.ready;
    await waitFor(() =>
      expect(
        document.querySelectorAll("[data-outside-scope] button.icon-button"),
      ).toHaveLength(2),
    );
    for (const iconButton of document.querySelectorAll(
      "[data-outside-scope] button.icon-button",
    )) {
      await expect(iconButton.closest(SCOPES)).toBeNull();
      await expectSquareCentredIconButton(iconButton);
    }
  },
};

/** The surface recolours the icon button. */
export const OnContrastedSurface: Story = {
  name: "On a contrasted surface",
  render: (args) => (
    <div
      className="contrasted"
      style={{
        ...row,
        background: "var(--surface-color-background)",
        color: "var(--surface-color-text)",
        padding: "var(--dimension-300)",
      }}
    >
      {MODIFIER_FAMILIES.importance.map((importance) => (
        <PairedIconButton key={importance} {...args} importance={importance} />
      ))}
    </div>
  ),
};

/** Props of a popover trigger. */
type PopoverIconButtonProps = {
  /** The icon button's props. */
  buttonProps: IconButtonProps;
  /** The id of the popover panel the button opens. */
  panelId: string;
  /** The panel's content. */
  panel: ReactNode;
};

/**
 * An icon button that opens a popover panel. The panel's `toggle` event
 * drives `aria-expanded` and keeps the Tooltip closed while the panel is open.
 */
function PopoverIconButton({
  buttonProps,
  panelId,
  panel,
}: PopoverIconButtonProps): ReactElement {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <TooltipEngine
        Message={buttonProps["aria-label"]}
        open={isOpen ? false : undefined}
      >
        <Component
          {...buttonProps}
          popoverTarget={panelId}
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          aria-controls={panelId}
        />
      </TooltipEngine>
      <dialog
        id={panelId}
        popover="auto"
        aria-label={buttonProps["aria-label"]}
        onToggle={(event) => setIsOpen(event.newState === "open")}
        style={{ padding: "var(--dimension-200)" }}
      >
        {panel}
      </dialog>
    </>
  );
}

/**
 * Expects the trigger's Tooltip to open on hover, close while the panel is
 * open, and open again after. The panel closes on a second press: a scripted
 * Escape does not dismiss a popover.
 */
const expectTooltipGatedByPanel = async (
  canvasElement: HTMLElement,
  name: string,
  panelId: string,
) => {
  const document = canvasElement.ownerDocument;
  const body = within(document.body);
  const button = within(canvasElement).getByRole("button", { name });

  await expect(body.queryByRole("tooltip")).toBeNull();
  await userEvent.hover(button);
  await expect(await findOpenTooltip(canvasElement)).toHaveTextContent(name);

  await userEvent.click(button);
  await waitFor(() => expect(button).toHaveAttribute("aria-expanded", "true"));
  await expect(
    document.querySelector(`#${panelId}:popover-open`),
  ).not.toBeNull();
  await waitFor(() => expect(body.queryByRole("tooltip")).toBeNull());

  await userEvent.click(button);
  await waitFor(() => expect(button).toHaveAttribute("aria-expanded", "false"));
  await expect(document.querySelector(`#${panelId}:popover-open`)).toBeNull();
  await userEvent.unhover(button);
  await waitFor(() => expect(body.queryByRole("tooltip")).toBeNull());
  await userEvent.hover(button);
  await expect(await findOpenTooltip(canvasElement)).toHaveTextContent(name);
  await userEvent.unhover(button);
  await waitFor(() => expect(body.queryByRole("tooltip")).toBeNull());
};

/** A popover trigger: keep the Tooltip closed while the panel is open. */
export const AsPopoverTrigger: Story = {
  name: "As a popover trigger",
  render: (args) => (
    <PopoverIconButton
      buttonProps={{
        ...args,
        importance: "tertiary",
        icon: "menu-contextual",
        "aria-label": "Row options",
      }}
      panelId="row-options"
      panel={
        <>
          <Button importance="tertiary">Rename</Button>
          <Button importance="tertiary" anticipation="destructive">
            Delete
          </Button>
        </>
      }
    />
  ),
  play: async ({ canvasElement }) => {
    await expectTooltipGatedByPanel(
      canvasElement,
      "Row options",
      "row-options",
    );
  },
};

/**
 * The data view triggers: a gear for settings, three vertical dots for
 * column options. Tertiary, no chevron, wired as a popover trigger.
 */
export const GearAndThreeDots: Story = {
  name: "Gear and three dots",
  render: (args) => (
    <div style={row}>
      <PopoverIconButton
        buttonProps={{
          ...args,
          importance: "tertiary",
          icon: "settings",
          "aria-label": "Table settings",
        }}
        panelId="table-settings"
        panel={<Button importance="tertiary">Show or hide columns</Button>}
      />
      <PopoverIconButton
        buttonProps={{
          ...args,
          importance: "tertiary",
          icon: "menu-contextual",
          "aria-label": "Column options",
        }}
        panelId="column-options"
        panel={<Button importance="tertiary">Sort ascending</Button>}
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    await expectTooltipGatedByPanel(
      canvasElement,
      "Table settings",
      "table-settings",
    );
    await expectTooltipGatedByPanel(
      canvasElement,
      "Column options",
      "column-options",
    );
  },
};
