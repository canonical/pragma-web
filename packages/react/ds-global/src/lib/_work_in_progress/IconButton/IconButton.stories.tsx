import { ICON_NAMES } from "@canonical/ds-assets";
import { MODIFIER_FAMILIES } from "@canonical/ds-types";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import * as decorators from "../../../storybook/decorators.js";
import { Button } from "../../component/Button/index.js";
import { TooltipEngine, withTooltip } from "../../component/Tooltip/index.js";
import Component from "./IconButton.js";

const meta = {
  title: "_work_in_progress/IconButton",
  component: Component,
  decorators: [decorators.surface],
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
};

/** Disabled, when the action is not available. */
export const Disabled: Story = {
  args: { disabled: true },
};

const row = {
  display: "flex",
  alignItems: "baseline",
  gap: "var(--dimension-200)",
} as const;

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
        <div key={density} className={`app ${density}`} style={row}>
          <span style={{ whiteSpace: "nowrap" }}>Instance name</span>
          <Component {...args} importance="tertiary" />
          <Component {...args} importance="secondary" />
          <Component {...args} importance="primary" />
          <Button importance="secondary">Rename</Button>
        </div>
      ))}
    </div>
  ),
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
    const button = canvas.getByRole("button", { name: "Row options" });
    await userEvent.hover(button);
    await findOpenTooltip(canvasElement);
    await userEvent.click(button);
    await waitFor(() =>
      expect(button).toHaveAttribute("aria-expanded", "true"),
    );
    await expect(
      canvasElement.ownerDocument.querySelector("#row-options:popover-open"),
    ).not.toBeNull();
    await waitFor(() =>
      expect(
        within(canvasElement.ownerDocument.body).queryByRole("tooltip"),
      ).toBeNull(),
    );
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
