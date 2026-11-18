import { ICON_NAMES } from "@canonical/ds-assets";
import { MODIFIER_FAMILIES } from "@canonical/ds-types";
import type { Decorator, Meta, StoryObj } from "@storybook/react-vite";
import type React from "react";
import { Fragment } from "react";
import { expect, fn } from "storybook/test";

import Component from "./Button.js";

/**
 * Render every story on a real surface: the `.surface` class defines the
 * `--surface-color-*` channels and the div paints itself with them (surfaces
 * consume themselves), so buttons sit on the same background they would in an
 * app rather than the bare Storybook canvas.
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
  title: "components/Button",
  component: Component,
  decorators: [surface],
  argTypes: {
    // Importance is never blank — primary is the default hierarchy.
    importance: {
      control: "select",
      options: [...MODIFIER_FAMILIES.importance],
    },
    anticipation: {
      control: "select",
      options: [undefined, ...MODIFIER_FAMILIES.anticipation],
    },
    variant: {
      control: "select",
      options: [undefined, "link"],
    },
    // Icon is a design-system icon NAME (not arbitrary markup): a select over the
    // ds-assets icon set, with `undefined` = no icon (the default).
    icon: {
      control: "select",
      options: [undefined, ...ICON_NAMES],
    },
  },
  args: { onClick: fn(), importance: "primary" },
} satisfies Meta<typeof Component>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: "Button",
  },
};

/** Button text follows its local context, not the page's root font size. */
export const TextContexts: Story = {
  render: (args) => (
    <>
      <div className="app">
        <Component {...args}>Save settings</Component>
      </div>
      <div className="site">
        <Component {...args}>Contact sales</Component>
      </div>
      <div className="docs">
        <Component {...args}>Copy example</Component>
      </div>
    </>
  ),
  play: async ({ canvas }) => {
    for (const [name, rem] of [
      ["Save settings", 0.875],
      ["Contact sales", 1],
      ["Copy example", 0.875],
    ] as const) {
      const button = canvas.getByRole("button", { name });
      const rootSize = getComputedStyle(
        button.ownerDocument.documentElement,
      ).fontSize;
      await expect(getComputedStyle(button).fontSize).toBe(
        `${rem * Number.parseFloat(rootSize)}px`,
      );
    }
  },
};

/** The importance × anticipation grid: importance as rows, the neutral base
 *  plus every anticipation as columns. Shared by the Matrix and DisabledMatrix
 *  stories. */
const MatrixGrid = (args: React.ComponentProps<typeof Component>) => (
  <div
    style={{
      display: "grid",
      gridTemplateColumns: `auto repeat(${
        MODIFIER_FAMILIES.anticipation.length + 1
      }, auto)`,
      gap: "0.75rem 1rem",
      alignItems: "center",
      justifyItems: "start",
    }}
  >
    {/* Header row: blank corner + column labels. */}
    <span />
    <span style={{ fontSize: "0.75rem", opacity: 0.6 }}>neutral</span>
    {MODIFIER_FAMILIES.anticipation.map((a) => (
      <span key={a} style={{ fontSize: "0.75rem", opacity: 0.6 }}>
        {a}
      </span>
    ))}

    {/* One row per importance. */}
    {MODIFIER_FAMILIES.importance.map((importance) => (
      <Fragment key={importance}>
        <span style={{ fontSize: "0.75rem", opacity: 0.6 }}>{importance}</span>
        <Component {...args} importance={importance}>
          Button
        </Component>
        {MODIFIER_FAMILIES.anticipation.map((anticipation) => (
          <Component
            key={anticipation}
            {...args}
            importance={importance}
            anticipation={anticipation}
          >
            Button
          </Component>
        ))}
      </Fragment>
    ))}
  </div>
);

/**
 * The full variant matrix: each importance (rows) combined with the neutral
 * base and every anticipation (columns). Importance decides how the colour is
 * applied — primary fills, secondary outlines, tertiary is text — while
 * anticipation (and the neutral base) decides which colour. The two compose
 * orthogonally.
 */
export const Matrix: Story = {
  render: (args) => <MatrixGrid {...args} />,
  args: { children: "Button" },
};

/**
 * The same matrix in the disabled state — every importance × anticipation
 * combination rendered `disabled`, so the disabled treatment is visible across
 * the whole grid.
 */
export const DisabledMatrix: Story = {
  render: (args) => <MatrixGrid {...args} />,
  args: { children: "Button", disabled: true },
};

/**
 * Link variant renders as inline text with underline.
 */
export const LinkVariant: Story = {
  args: {
    children: "Learn more",
    variant: "link",
  },
};

/**
 * The full matrix with a leading icon in every cell — so the icon colour can be
 * checked against each importance × anticipation combination. For destructive
 * actions, both the icon and the label use the on-fill contrast colour on
 * primary and the intent colour on secondary and tertiary. The `icon` prop
 * takes a design-system icon name;
 * the sprite is served from the `@canonical/ds-assets` staticDir at `/icons`.
 */
export const IconMatrix: Story = {
  render: (args) => <MatrixGrid {...args} />,
  args: { children: "Button", icon: "edit" },
  play: async ({ canvasElement }) => {
    const primary = canvasElement.querySelector("button.primary.destructive");
    const secondary = canvasElement.querySelector(
      "button.secondary.destructive",
    );
    const tertiary = canvasElement.querySelector("button.tertiary.destructive");
    if (!primary || !secondary || !tertiary) {
      throw new Error("Expected all three destructive Button importances");
    }

    await expect(getComputedStyle(secondary).color).toBe(
      getComputedStyle(tertiary).color,
    );
    await expect(getComputedStyle(primary).color).not.toBe(
      getComputedStyle(secondary).color,
    );
  },
};

/**
 * The icon matrix in the disabled state — the icon should dim with the label
 * across every combination.
 */
export const DisabledIconMatrix: Story = {
  render: (args) => <MatrixGrid {...args} />,
  args: { children: "Button", icon: "edit", disabled: true },
};

/**
 * A loading button shows a Spinner in the leading icon slot, is marked
 * `aria-busy`, and is disabled so the action cannot be triggered again while
 * it is in flight.
 */
export const Loading: Story = {
  args: {
    children: "Saving",
    loading: true,
  },
};
