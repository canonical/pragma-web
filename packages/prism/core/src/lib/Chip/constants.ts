import type {
  Box,
  BoxEncoding,
  Channel,
  ChannelDescriptor,
  EncodingIndex,
  Kind,
  KindEncoding,
  Lifecycle,
  LifecycleEncoding,
} from "./types.js";

/** Root CSS class names, shared with `styles.css`. */
export const CHIP_CSS_CLASS_NAME = "ds chip";
export const LEGEND_CSS_CLASS_NAME = "ds chip-legend";

/** Entity families (the shape channel's vocabulary). */
export const KINDS = [
  "component",
  "pattern",
  "standard",
  "concept",
  "term",
  "token",
] as const;

/** TBox class vs ABox instance (the border-vs-fill channel's vocabulary). */
export const BOXES = ["class", "instance"] as const;

/** Lifecycle states (the status-dot channel's vocabulary). */
export const LIFECYCLES = ["canonical", "beta", "deprecated", "none"] as const;

/** The four channels, in the order the legend presents them. */
export const CHANNELS = ["namespace", "box", "kind", "lifecycle"] as const;

/** A mention names a thing (an ABox individual) unless it says otherwise. */
export const DEFAULT_BOX: Box = "instance";

/** Chips are lifecycle-silent unless the mention has something to say. */
export const DEFAULT_LIFECYCLE: Lifecycle = "none";

/**
 * The hue step between consecutive prefixes, in degrees: the golden angle.
 * Stepping by it spreads any number of hues around the wheel without two
 * neighbours landing close, and each prefix's hue depends only on its own
 * place in the list.
 */
export const GOLDEN_ANGLE_DEGREES = 137.508;

/**
 * The tint of a mention whose namespace is not one of the site's prefixes:
 * the tint lightness with no chroma, behind its own theme hook.
 */
export const UNKNOWN_NAMESPACE_TINT =
  "var(--chip-tint-unknown, oklch(var(--chip-tint-l, 0.45) 0 0))";

export const KIND_INDEX: EncodingIndex<Kind, KindEncoding> = {
  component: {
    value: "component",
    label: "Component",
    description: "A buildable UI component.",
    shape: "rounded",
    radius: "var(--chip-radius-component, 0.375em)",
  },
  pattern: {
    value: "pattern",
    label: "Pattern",
    description: "A composition of components solving a recurring problem.",
    shape: "pill",
    radius: "var(--chip-radius-pattern, 1.25em)",
  },
  standard: {
    value: "standard",
    label: "Standard",
    description: "A normative rule the codebase is held to.",
    shape: "square",
    radius: "var(--chip-radius-standard, 0)",
  },
  concept: {
    value: "concept",
    label: "Concept",
    description: "An idea the corpus reasons with.",
    shape: "leaf",
    radius: "var(--chip-radius-concept, 1em 0.25em)",
  },
  term: {
    value: "term",
    label: "Term",
    description: "A glossary word with a pinned meaning.",
    shape: "leaf-reverse",
    radius: "var(--chip-radius-term, 0.25em 1em)",
  },
  token: {
    value: "token",
    label: "Token",
    description: "A named design value (colour, spacing, type…).",
    shape: "tag",
    radius: "var(--chip-radius-token, 0 0.75em 0.75em 0)",
  },
};

export const BOX_INDEX: EncodingIndex<Box, BoxEncoding> = {
  class: {
    value: "class",
    label: "Class (TBox)",
    description: "A category of things — outlined, not filled.",
    fillWeight: "0%",
    strokeWeight: "80%",
  },
  instance: {
    value: "instance",
    label: "Instance (ABox)",
    description: "One concrete thing — filled, no outline.",
    fillWeight: "var(--chip-fill-weight-instance, 15%)",
    strokeWeight: "0%",
  },
};

export const LIFECYCLE_INDEX: EncodingIndex<Lifecycle, LifecycleEncoding> = {
  canonical: {
    value: "canonical",
    label: "Canonical",
    description: "The blessed, current form.",
    dot: "var(--chip-dot-canonical, oklch(0.55 0.15 150))",
  },
  beta: {
    value: "beta",
    label: "Beta",
    description: "Usable, still settling.",
    dot: "var(--chip-dot-beta, oklch(0.65 0.15 85))",
  },
  deprecated: {
    value: "deprecated",
    label: "Deprecated",
    description: "On the way out; prefer the replacement.",
    dot: "var(--chip-dot-deprecated, oklch(0.55 0.2 25))",
  },
  none: {
    value: "none",
    label: "Unmarked",
    description: "Lifecycle not asserted — no dot.",
    dot: null,
  },
};

export const CHANNEL_INDEX: EncodingIndex<Channel, ChannelDescriptor> = {
  namespace: {
    value: "namespace",
    label: "Tint — namespace",
    description: "The colour says which vocabulary the entity belongs to.",
  },
  box: {
    value: "box",
    label: "Border vs fill — class vs instance",
    description:
      "An outline marks a class (TBox); a fill marks an instance (ABox).",
  },
  kind: {
    value: "kind",
    label: "Shape — entity family",
    description: "The silhouette says what family of thing is mentioned.",
  },
  lifecycle: {
    value: "lifecycle",
    label: "Dot — lifecycle",
    description: "A leading dot marks canonical, beta or deprecated status.",
  },
};

/** Row tables in presentation order — the legend generates from these. */
export const KIND_ENCODINGS: readonly KindEncoding[] = KINDS.map(
  (value) => KIND_INDEX[value],
);
export const BOX_ENCODINGS: readonly BoxEncoding[] = BOXES.map(
  (value) => BOX_INDEX[value],
);
export const LIFECYCLE_ENCODINGS: readonly LifecycleEncoding[] = LIFECYCLES.map(
  (value) => LIFECYCLE_INDEX[value],
);
export const CHANNEL_DESCRIPTORS: readonly ChannelDescriptor[] = CHANNELS.map(
  (value) => CHANNEL_INDEX[value],
);
