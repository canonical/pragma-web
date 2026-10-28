/**
 * `@canonical/prism-core`'s chrome ships no Storybook of its own; its
 * stories live in the docs site, rendered over the site's styles.
 */

import {
  type Box,
  ChipLegend,
  MentionChip as Component,
  type Kind,
  type Lifecycle,
} from "@canonical/prism-core";
import type { Meta, StoryObj } from "@storybook/react-vite";

/** The site's namespace prefixes, in the order the provider lists them. */
const PREFIXES = ["ds", "cs", "docs"] as const;

/** Every kind, labelled; `satisfies` keeps the matrix total. */
const KIND_LABELS = {
  component: "Component",
  pattern: "Pattern",
  standard: "Standard",
  concept: "Concept",
  term: "Term",
  token: "Token",
} as const satisfies Record<Kind, string>;

/** Every box, labelled. */
const BOX_LABELS = {
  class: "Class (TBox)",
  instance: "Instance (ABox)",
} as const satisfies Record<Box, string>;

/** Every lifecycle, labelled. */
const LIFECYCLE_LABELS = {
  canonical: "Canonical",
  beta: "Beta",
  deprecated: "Deprecated",
  none: "Unmarked",
} as const satisfies Record<Lifecycle, string>;

const BUTTON_URI = "ds:global.component.button";
const BUTTON_HREF = `/components/${encodeURIComponent(BUTTON_URI)}`;

const meta: Meta<typeof Component> = {
  title: "Prism/MentionChip",
  component: Component,
  tags: ["autodocs"],
  // A baseline mention every story inherits; the matrix stories map over
  // the label tables instead.
  args: {
    uri: BUTTON_URI,
    label: "Button",
    kind: "component",
    prefixes: PREFIXES,
  },
};

export default meta;
type Story = StoryObj<typeof Component>;

export const Default: Story = {};

/** One chip per entity family: the shape channel. */
export const Kinds: Story = {
  render: () => (
    <p>
      {Object.entries(KIND_LABELS).map(([kind, label]) => (
        <span key={kind}>
          <Component
            kind={kind as Kind}
            label={label}
            prefixes={PREFIXES}
            uri={`docs:example.${kind}`}
          />{" "}
        </span>
      ))}
    </p>
  ),
};

/** One chip per namespace, plus one outside the list: the tint channel. */
export const Namespaces: Story = {
  render: () => (
    <p>
      {[...PREFIXES, "other"].map((prefix) => (
        <span key={prefix}>
          <Component
            kind="concept"
            label={prefix}
            prefixes={PREFIXES}
            uri={`${prefix}:example.concept`}
          />{" "}
        </span>
      ))}
    </p>
  ),
};

/** Outline marks a TBox class; fill marks an ABox instance. */
export const ClassVersusInstance: Story = {
  render: () => (
    <p>
      {Object.entries(BOX_LABELS).map(([box, label]) => (
        <span key={box}>
          <Component
            box={box as Box}
            kind="component"
            label={label}
            prefixes={PREFIXES}
            uri={BUTTON_URI}
          />{" "}
        </span>
      ))}
    </p>
  ),
};

/** The status dot per lifecycle state (unmarked shows no dot). */
export const Lifecycles: Story = {
  render: () => (
    <p>
      {Object.entries(LIFECYCLE_LABELS).map(([lifecycle, label]) => (
        <span key={lifecycle}>
          <Component
            kind="component"
            label={label}
            lifecycle={lifecycle as Lifecycle}
            prefixes={PREFIXES}
            uri={BUTTON_URI}
          />{" "}
        </span>
      ))}
    </p>
  ),
};

/** With an href the chip is a link to the noun's home; without, inert text. */
export const LinkVersusText: Story = {
  render: () => (
    <p>
      <Component
        href={BUTTON_HREF}
        kind="component"
        label="Button (linked)"
        prefixes={PREFIXES}
        uri={BUTTON_URI}
      />{" "}
      <Component
        kind="component"
        label="Button (text only)"
        prefixes={PREFIXES}
        uri={BUTTON_URI}
      />
    </p>
  ),
};

/** A `summary` reveals a lightweight definition peek on hover. */
export const WithSummary: Story = {
  args: {
    summary: "The design system's primary action component.",
  },
};

/** Chips never block the reading path: a sentence with mentions still reads
 * as a sentence. */
export const InProse: Story = {
  render: () => (
    <p style={{ maxWidth: "36rem" }}>
      When composing a form, reach for the{" "}
      <Component
        href={BUTTON_HREF}
        kind="component"
        label="Button"
        lifecycle="canonical"
        prefixes={PREFIXES}
        summary="The design system's primary action component."
        uri={BUTTON_URI}
      />{" "}
      component rather than a bare element, follow the{" "}
      <Component
        box="class"
        href={`/standards/${encodeURIComponent("cs:typescript.imports")}`}
        kind="standard"
        label="imports"
        prefixes={PREFIXES}
        uri="cs:typescript.imports"
      />{" "}
      standard for module wiring, and mind the{" "}
      <Component
        kind="term"
        label="density"
        prefixes={PREFIXES}
        summary="How tightly a layout packs its controls."
        uri="docs:glossary.density"
      />{" "}
      of the surrounding layout.
    </p>
  ),
};

/**
 * A narrow container forces a long label to wrap across lines, so
 * `box-decoration-break: clone` (padding, border and corners cloned onto
 * each fragment; the lifecycle dot only on the first) is visually
 * inspectable.
 */
export const Wrapping: Story = {
  render: () => (
    <p style={{ maxWidth: "14rem" }}>
      Compose a form around the{" "}
      <Component
        href={`/components/${encodeURIComponent("ds:global.pattern.multi-step-form-wizard")}`}
        kind="pattern"
        label="Multi-step form wizard"
        lifecycle="beta"
        prefixes={PREFIXES}
        uri="ds:global.pattern.multi-step-form-wizard"
      />{" "}
      pattern when a single page grows too long to submit at once.
    </p>
  ),
};

/** The legend generates from the same rows that drive rendering. */
export const Legend: Story = {
  render: () => <ChipLegend prefixes={PREFIXES} />,
};
