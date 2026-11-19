import { ICON_NAMES } from "@canonical/ds-assets";
import { MODIFIER_FAMILIES } from "@canonical/ds-types";
import type { Meta, StoryObj } from "@storybook/react-vite";
import type React from "react";
import { Fragment } from "react";
import { fn } from "storybook/test";
import * as decorators from "../../../storybook/decorators.js";

import Component from "./Button.js";

const meta = {
  title: "components/Button",
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
    variant: {
      control: "select",
      options: [undefined, "link"],
    },
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

/** Renders every importance against every anticipation. */
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
    <span />
    <span style={{ fontSize: "0.75rem", opacity: 0.6 }}>neutral</span>
    {MODIFIER_FAMILIES.anticipation.map((a) => (
      <span key={a} style={{ fontSize: "0.75rem", opacity: 0.6 }}>
        {a}
      </span>
    ))}

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

/** Every importance with every anticipation. */
export const Matrix: Story = {
  render: (args) => <MatrixGrid {...args} />,
  args: { children: "Button" },
};

/** The matrix, disabled. */
export const DisabledMatrix: Story = {
  render: (args) => <MatrixGrid {...args} />,
  args: { children: "Button", disabled: true },
};

/** A button styled as an inline link. */
export const LinkVariant: Story = {
  args: {
    children: "Learn more",
    variant: "link",
  },
};

/** Renders one button per importance. */
const ImportanceRow = (args: React.ComponentProps<typeof Component>) => (
  <div style={{ display: "flex", gap: "var(--dimension-200, 16px)" }}>
    {MODIFIER_FAMILIES.importance.map((importance) => (
      <Component key={importance} {...args} importance={importance}>
        {importance}
      </Component>
    ))}
  </div>
);

/** Every importance on .contrasted and on a .surface nested in it. */
export const OnContrastedSurface: Story = {
  decorators: [decorators.contrasted()],
  render: (args) => (
    <div style={{ display: "grid", gap: "var(--dimension-200, 16px)" }}>
      <ImportanceRow {...args} />
      <div
        className="surface"
        style={{
          background: "var(--surface-color-background)",
          color: "var(--surface-color-text, var(--color-text))",
          padding: "var(--dimension-200, 16px)",
        }}
      >
        <ImportanceRow {...args} />
      </div>
    </div>
  ),
};

/** The matrix with a leading icon. */
export const IconMatrix: Story = {
  render: (args) => <MatrixGrid {...args} />,
  args: { children: "Button", icon: "edit" },
};

/** The icon matrix, disabled. */
export const DisabledIconMatrix: Story = {
  render: (args) => <MatrixGrid {...args} />,
  args: { children: "Button", icon: "edit", disabled: true },
};

/** A busy, disabled button with a spinner. */
export const Loading: Story = {
  args: {
    children: "Saving",
    loading: true,
  },
};
