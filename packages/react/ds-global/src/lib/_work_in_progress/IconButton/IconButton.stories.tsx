import { ICON_NAMES } from "@canonical/ds-assets";
import { MODIFIER_FAMILIES } from "@canonical/ds-types";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import * as decorators from "../../../storybook/decorators.js";
import { Button } from "../../component/Button/index.js";
import { TooltipEngine, withTooltip } from "../../component/Tooltip/index.js";
import Component from "./IconButton.js";

const meta = {
  title: "_work_in_progress/IconButton",
  component: Component,
  decorators: [decorators.surface()],
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

/**
 * The first element under `parent` that matches `selector`. Throws when there
 * is none, so a play fails on a missing part rather than measuring nothing.
 */
const findRequiredElement = (parent: ParentNode, selector: string): Element => {
  const element = parent.querySelector(selector);
  if (!element) throw new Error(`No element matches "${selector}".`);
  return element;
};

/** The border box of an element, in CSS pixels. */
const measureBox = (element: Element) => element.getBoundingClientRect();

/**
 * Checks that one icon button is as wide as it is tall, with its icon
 * centred in the box, and returns the box.
 */
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
 * Checks the geometry IconButton exists for, in every row of `canvasElement`
 * that holds icon buttons and a labelled Button: each icon button is as wide
 * as it is tall, as tall as the labelled Button, on its top edge (so on its
 * baseline, the seat being the same), with the icon centred in the box.
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

/** Secondary: the outlined importance. */
export const Secondary: Story = {
  args: { importance: "secondary" },
};

/** Tertiary: the borderless importance, the usual look of an icon button. */
export const Tertiary: Story = {
  args: { importance: "tertiary" },
};

/**
 * While its action runs, the icon button shows a spinner in place of its
 * icon and cannot be pressed again; it keeps its size.
 */
export const Loading: Story = {
  args: { loading: true, "aria-label": "Saving" },
  render: (args) => (
    <div style={row}>
      <Component {...args} />
      <Component {...args} loading={false} aria-label="Save" />
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

/** Disabled, when the action is not available. */
export const Disabled: Story = {
  args: { disabled: true },
};

/**
 * In a row aligned on the text baseline, icon buttons line up with the text
 * and with a labelled Button, in both densities, and each is exactly as wide
 * as it is tall. The baseline grid overlay is on.
 */
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
          <Component {...args} importance="tertiary" />
          <Component {...args} importance="secondary" />
          <Component {...args} importance="primary" />
          <Button importance="secondary">Rename</Button>
        </div>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    await expectSquareSeatedIconButtons(canvasElement);
  },
};

/**
 * A Tooltip portals its message to the document body: stories that show
 * one render in a docs iframe of their own.
 */
const tooltipParameters = {
  docs: { story: { inline: false, iframeHeight: "240px" } },
} as const;

/** The Tooltip, once it is open, from the whole document. */
const findOpenTooltip = (canvasElement: HTMLElement) =>
  within(canvasElement.ownerDocument.body).findByRole("tooltip");

/** An icon button paired once, by composition, with a fixed message. */
const EditButtonWithTooltip = withTooltip(Component, "Edit");

/**
 * Always pair an icon button with a Tooltip that states the action, as
 * Button's guideline asks for every icon-only button. Compose it: wrap the
 * icon button with `withTooltip`, or render `TooltipEngine` around it when
 * the message has to follow state. The Tooltip shows on hover or focus,
 * after its own delay.
 */
export const WithTooltip: Story = {
  name: "With Tooltip",
  args: { importance: "tertiary" },
  parameters: tooltipParameters,
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

/** Anticipation recolours the icon button as it recolours a Button. */
export const Anticipation: Story = {
  render: (args) => (
    <div style={{ display: "grid", gap: "var(--dimension-200)" }}>
      {(["destructive", "constructive"] as const).map((anticipation) => (
        <div key={anticipation} style={row}>
          {MODIFIER_FAMILIES.importance.map((importance) => (
            <Component
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
 * Every context (app, site, docs) in both densities, with the baseline grid
 * on: the icon button follows the density cell, and stays on the text's
 * baseline with or without a Tooltip around it.
 */
export const DensityAndContext: Story = {
  name: "Density and context",
  parameters: { baseline: true, ...tooltipParameters },
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
            <TooltipEngine Message="Edit">
              <Component {...args} importance="tertiary" />
            </TooltipEngine>
            <Component {...args} importance="secondary" />
            <TooltipEngine Message="Edit">
              <Component {...args} importance="primary" />
            </TooltipEngine>
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

/** The density and context classes Button's seat reads its inputs from. */
const SCOPES = ".comfortable, .dense, .app, .site, .docs";

/**
 * A test-only story: Storybook puts a density and a context on its root, so
 * this one portals its row to a container on the document body, outside
 * every scope, where Button has no seat. There the icon button is still as
 * wide as it is tall, with its icon centred, with and without a Tooltip
 * around it. A labelled Button is taller there, so it is not compared.
 */
export const OutsideADensityScope: Story = {
  name: "Outside a density scope",
  tags: ["!dev", "!autodocs"],
  // The row is portalled, which the generated JSX source cannot print, so
  // the story names its source instead.
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
    // A fragment, so the story always returns an element; the row joins it
    // once the container exists.
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

/** On a contrasted surface, the surface recolours the icon button. */
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
        <Component key={importance} {...args} importance={importance} />
      ))}
    </div>
  ),
};

/**
 * As the trigger of a popover panel, wired with `popoverTarget`. Keep the
 * Tooltip closed while the panel is open, so it never covers what the
 * button opened: here the panel's `toggle` event drives both
 * `aria-expanded` and the Tooltip's `open`.
 */
export const AsPopoverTrigger: Story = {
  name: "As a popover trigger",
  parameters: tooltipParameters,
  render: function AsPopoverTriggerRender(args) {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <>
        <TooltipEngine Message="Row options" open={isOpen ? false : undefined}>
          <Component
            {...args}
            importance="tertiary"
            icon="menu-contextual"
            aria-label="Row options"
            popoverTarget="row-options"
            aria-expanded={isOpen}
            aria-controls="row-options"
          />
        </TooltipEngine>
        <section
          id="row-options"
          popover="auto"
          aria-label="Row options"
          onToggle={(event) => setIsOpen(event.newState === "open")}
          style={{ padding: "var(--dimension-200)" }}
        >
          <Button importance="tertiary">Rename</Button>
          <Button importance="tertiary" anticipation="destructive">
            Delete
          </Button>
        </section>
      </>
    );
  },
  play: async ({ canvas, canvasElement }) => {
    const document = canvasElement.ownerDocument;
    const body = within(document.body);
    const button = canvas.getByRole("button", { name: "Row options" });

    // Closed until the button is hovered.
    await expect(body.queryByRole("tooltip")).toBeNull();
    await userEvent.hover(button);
    await findOpenTooltip(canvasElement);

    // Opening the panel closes the Tooltip.
    await userEvent.click(button);
    await waitFor(() =>
      expect(button).toHaveAttribute("aria-expanded", "true"),
    );
    await expect(
      document.querySelector("#row-options:popover-open"),
    ).not.toBeNull();
    await waitFor(() => expect(body.queryByRole("tooltip")).toBeNull());

    // Closing the panel, with a second press, lets the Tooltip show again
    // on the next hover. (A scripted Escape is not a trusted key press, so
    // the browser does not light-dismiss the popover on it.)
    await userEvent.click(button);
    await waitFor(() =>
      expect(button).toHaveAttribute("aria-expanded", "false"),
    );
    await expect(
      document.querySelector("#row-options:popover-open"),
    ).toBeNull();
    await userEvent.unhover(button);
    await waitFor(() => expect(body.queryByRole("tooltip")).toBeNull());
    await userEvent.hover(button);
    await findOpenTooltip(canvasElement);
  },
};

const TableSettingsButton = withTooltip(Component, "Table settings");
const ColumnOptionsButton = withTooltip(Component, "Column options");

/**
 * The data view triggers: a gear for the table settings and three vertical
 * dots for the column and row options, each paired with its Tooltip. Both
 * are tertiary, and neither has a chevron: they are icon buttons, not
 * dropdown buttons.
 */
export const GearAndThreeDots: Story = {
  name: "Gear and three dots",
  parameters: tooltipParameters,
  render: (args) => (
    <div style={row}>
      <TableSettingsButton
        {...args}
        importance="tertiary"
        icon="settings"
        aria-label="Table settings"
      />
      <ColumnOptionsButton
        {...args}
        importance="tertiary"
        icon="menu-contextual"
        aria-label="Column options"
      />
    </div>
  ),
};
