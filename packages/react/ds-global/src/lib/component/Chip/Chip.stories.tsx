import { ICON_NAMES } from "@canonical/ds-assets";
import { MODIFIER_FAMILIES } from "@canonical/ds-types";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { Badge } from "../Badge/index.js";
import Component from "./Chip.js";
import type { ChipProps } from "./types.js";

/**
 * The props both kinds of chip share, picked from the story args. Spreading
 * the union-typed args directly fails type-checking.
 */
const pickSharedArgs = ({
  value,
  lead,
  icon,
  badge,
  criticality,
}: Pick<ChipProps, "value" | "lead" | "icon" | "badge" | "criticality">) => ({
  value,
  lead,
  icon,
  badge,
  criticality,
});

const meta = {
  title: "components/Chip",
  component: Component,
  args: {
    value: "Ubuntu",
    onClick: fn(),
  },
  argTypes: {
    criticality: {
      options: [undefined, ...MODIFIER_FAMILIES.criticality],
      control: { type: "radio" },
    },
    icon: {
      options: [undefined, ...ICON_NAMES],
      control: { type: "select" },
    },
    disabled: { control: { type: "boolean" } },
    badge: { control: false },
    children: { control: false },
    onClick: { control: false },
  },
} satisfies Meta<typeof Component>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * **Action chip.** `onClick` is the chip's one action: the whole chip is a
 * `<button>` that takes focus, and activating it runs the action, such as
 * applying a filter. A chip has exactly one action — either `onClick` or a
 * single `Chip.Dismiss` child. Both, or neither, is a type error; read-only
 * metadata belongs on a `Tag`.
 */
export const Default: Story = {};

/**
 * **A chip has exactly one action — either/or.** Left: `onClick` makes the
 * chip itself the action. Right: a single `Chip.Dismiss` child makes only its
 * control the action. Passing both, or neither, is a type error.
 */
export const ActionOrDismiss: Story = {
  parameters: { controls: { disable: true } },
  render: (args) => (
    <div style={{ display: "flex", gap: "var(--dimension-100)" }}>
      <Component
        {...pickSharedArgs(args)}
        lead="Owner"
        value="Bob"
        onClick={args.onClick ?? fn()}
      />
      <Component {...pickSharedArgs(args)} lead="Owner" value="Bob">
        <Component.Dismiss onClick={fn()} />
      </Component>
    </div>
  ),
};

/**
 * **Dismissible chip.** A single `Chip.Dismiss` child is the chip's one
 * action: the chip itself is a `<span>`, and only the dismiss control takes
 * focus, for example to remove an applied filter. `Chip.Dismiss` takes native
 * button props.
 */
export const Dismissible: Story = {
  parameters: { controls: { exclude: ["onClick", "disabled"] } },
  render: (args) => (
    <Component {...pickSharedArgs(args)} lead="Owner" value="Bob">
      <Component.Dismiss onClick={fn()} />
    </Component>
  ),
};

/**
 * A lead names the attribute the value belongs to.
 */
export const WithLead: Story = {
  args: { lead: "Category" },
};

/**
 * A leading icon from the design-system icon set.
 */
export const WithIcon: Story = {
  args: { icon: "archive", value: "Archive" },
};

/**
 * A badge follows the value, for example to show a count.
 */
export const WithBadge: Story = {
  args: { lead: "Projects", badge: <Badge value={3} /> },
};

/**
 * Criticality modifiers reflect the status of the chip's subject. The first
 * row shows the action chips at full strength; the second row shows the same
 * chips **disabled**, each criticality in its disabled tint.
 */
export const Criticality: Story = {
  parameters: { controls: { disable: true } },
  render: (args) => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--dimension-100)",
      }}
    >
      <div style={{ display: "flex", gap: "var(--dimension-050)" }}>
        <Component
          {...pickSharedArgs(args)}
          lead="Status"
          value="neutral"
          onClick={args.onClick ?? fn()}
        />
        {MODIFIER_FAMILIES.criticality.map((criticality) => (
          <Component
            {...pickSharedArgs(args)}
            key={criticality}
            lead="Status"
            value={criticality}
            criticality={criticality}
            onClick={args.onClick ?? fn()}
          />
        ))}
      </div>
      <div style={{ display: "flex", gap: "var(--dimension-050)" }}>
        <Component
          {...pickSharedArgs(args)}
          disabled
          lead="Status"
          value="neutral"
          onClick={args.onClick ?? fn()}
        />
        {MODIFIER_FAMILIES.criticality.map((criticality) => (
          <Component
            {...pickSharedArgs(args)}
            key={criticality}
            disabled
            lead="Status"
            value={criticality}
            criticality={criticality}
            onClick={args.onClick ?? fn()}
          />
        ))}
      </div>
    </div>
  ),
};

/**
 * A disabled action chip cannot be activated.
 */
export const Disabled: Story = {
  args: { lead: "Category", disabled: true },
  argTypes: { disabled: { control: false } },
};

/**
 * Disabling the dismiss control disables the whole chip, for example while the
 * removal is saving.
 */
export const DismissibleDisabled: Story = {
  parameters: { controls: { exclude: ["onClick", "disabled"] } },
  render: (args) => (
    <Component {...pickSharedArgs(args)} lead="Owner" value="Bob">
      <Component.Dismiss onClick={fn()} disabled />
    </Component>
  ),
};

/**
 * When its container is too narrow, the value is truncated. The full text stays
 * available as a native tooltip. Avoid truncation where possible.
 */
export const Truncated: Story = {
  args: {
    lead: "Description",
    value: "A very long value that does not fit in its container",
  },
  render: (args) => (
    <div style={{ inlineSize: "14rem" }}>
      <Component {...pickSharedArgs(args)} onClick={args.onClick ?? fn()} />
    </div>
  ),
};
