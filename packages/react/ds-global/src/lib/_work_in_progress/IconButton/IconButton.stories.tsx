import { ICON_NAMES } from "@canonical/ds-assets";
import { MODIFIER_FAMILIES } from "@canonical/ds-types";
import type { Decorator, Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { Button } from "../../component/Button/index.js";
import Component from "./IconButton.js";

/**
 * Render every story on a real surface, as Button's stories do, so the button
 * sits on the background it would have in an app. It stays inline, as in
 * Button's stories: the shared `surfaces` decorator draws three nested bands,
 * which is more than an icon button needs.
 */
const surface: Decorator = (Story) => (
  <div
    className="surface"
    style={{
      background: "var(--surface-color-background)",
      color: "var(--surface-color-text)",
      padding: "var(--dimension-300, 24px)",
    }}
  >
    <Story />
  </div>
);

const meta = {
  title: "_work_in_progress/IconButton",
  component: Component,
  decorators: [surface],
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

/** Secondary: the outlined ghost importance. */
export const Secondary: Story = {
  args: { importance: "secondary" },
};

/** Tertiary: the borderless ghost importance, the usual icon-only look. */
export const Tertiary: Story = {
  args: { importance: "tertiary" },
};

/**
 * Loading overlays Button's Spinner on the centred icon, marks the button
 * `aria-busy` and disables it, while the box keeps its size.
 */
export const Loading: Story = {
  args: { loading: true, "aria-label": "Saving" },
};

/** Disabled takes Button's disabled surface, text and icon colours. */
export const Disabled: Story = {
  args: { disabled: true },
};

const row = {
  display: "flex",
  alignItems: "baseline",
  gap: "var(--dimension-200)",
} as const;

/**
 * An icon button beside a line of text and a labelled Button, in a flex row
 * aligned on `baseline`, in both densities with the baseline grid overlay on.
 * The icon button's baseline is a generated line of text seated like
 * Button's label, so the text, the label and the icon button share one
 * baseline, and every box spans the same grid lines; the icon button's box is
 * exactly as wide as it is tall.
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

/** Tooltip stories portal their message: show them in an iframe of their own. */
const tooltipParameters = {
  docs: { story: { inline: false, iframeHeight: "200px" } },
} as const;

/** The Tooltip, once the engine has opened it, from the whole document. */
const findOpenTooltip = (canvasElement: HTMLElement) =>
  within(canvasElement.ownerDocument.body).findByRole("tooltip");

/**
 * The default: a Tooltip whose message is the `aria-label`, shown on hover or
 * focus after the Tooltip's own delay, as Button's guideline asks for every
 * icon-only button.
 */
export const WithTooltip: Story = {
  name: "With Tooltip",
  args: { importance: "tertiary", icon: "edit", "aria-label": "Edit" },
  parameters: tooltipParameters,
  play: async ({ canvas, canvasElement }) => {
    const button = canvas.getByRole("button", { name: "Edit" });
    await userEvent.tab();
    await expect(button).toHaveFocus();
    await expect(await findOpenTooltip(canvasElement)).toHaveTextContent(
      "Edit",
    );
  },
};

/**
 * A Tooltip message that differs from the accessible name. It is visual
 * only for now: the Tooltip engine describes its own wrapper, not the button,
 * so a screen reader does not announce this message.
 */
export const TooltipWithDifferentMessage: Story = {
  name: "Tooltip with a different message",
  args: {
    importance: "tertiary",
    icon: "copy",
    "aria-label": "Copy",
    tooltip: "Copy the instance address",
  },
  parameters: tooltipParameters,
  play: async ({ canvas, canvasElement }) => {
    await userEvent.hover(canvas.getByRole("button", { name: "Copy" }));
    await expect(await findOpenTooltip(canvasElement)).toHaveTextContent(
      "Copy the instance address",
    );
  },
};

/**
 * `tooltip={false}` when the action is already written next to the button.
 * The `<button>` is then the outermost element.
 */
export const WithoutTooltip: Story = {
  name: "Without Tooltip",
  render: (args) => (
    <div style={row}>
      <Component
        {...args}
        importance="tertiary"
        icon="delete"
        aria-label="Delete"
        tooltip={false}
      />
      <span>Delete the instance</span>
    </div>
  ),
};

/** Anticipation recolours the icon button as it does Button. */
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
 * and the Tooltip on: the box is the density cell both ways, and the Tooltip's
 * wrapper keeps the icon button on the text's baseline.
 */
export const DensityAndContext: Story = {
  name: "Density and context",
  parameters: { baseline: true },
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
            <Component {...args} importance="tertiary" />
            <Component {...args} importance="secondary" tooltip={false} />
            <Component {...args} importance="primary" />
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
 * As the trigger of a panel: while `aria-expanded` is true the Tooltip stays
 * closed, so it never covers the panel it opened.
 */
export const AsMenuTrigger: Story = {
  name: "As a menu trigger",
  parameters: tooltipParameters,
  render: function AsMenuTriggerRender(args) {
    const [isExpanded, setIsExpanded] = useState(false);
    return (
      <div style={{ display: "grid", gap: "var(--dimension-200)" }}>
        <Component
          {...args}
          importance="tertiary"
          icon="menu-contextual"
          aria-label="Row options"
          aria-haspopup="menu"
          aria-expanded={isExpanded}
          onClick={() => setIsExpanded((expanded) => !expanded)}
        />
        {isExpanded ? <span>The row options panel is open.</span> : null}
      </div>
    );
  },
  play: async ({ canvas, canvasElement }) => {
    const button = canvas.getByRole("button", { name: "Row options" });
    await userEvent.hover(button);
    await findOpenTooltip(canvasElement);
    await userEvent.click(button);
    await expect(button).toHaveAttribute("aria-expanded", "true");
    await waitFor(() =>
      expect(
        within(canvasElement.ownerDocument.body).queryByRole("tooltip"),
      ).toBeNull(),
    );
  },
};

/**
 * The DataViews triggers: a gear for the table settings and three vertical
 * dots for the column and row options. Both are tertiary, and neither has a
 * chevron: they are icon buttons, not dropdown buttons.
 */
export const GearAndThreeDots: Story = {
  name: "Gear and three dots",
  render: (args) => (
    <div style={row}>
      <Component
        {...args}
        importance="tertiary"
        icon="settings"
        aria-label="Table settings"
      />
      <Component
        {...args}
        importance="tertiary"
        icon="menu-contextual"
        aria-label="Column options"
      />
    </div>
  ),
};
