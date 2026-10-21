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

/**
 * The shape channel's encoding, one row per {@link KINDS} value, each row's
 * `value` equal to its key (the type makes a missing or mismatched row a
 * compile error). The label, description and shape copy are catalog keys,
 * read through `t()`; `radius` is the chip's `border-radius`, behind a
 * per-kind theme hook.
 */
export const KIND_INDEX: EncodingIndex<Kind, KindEncoding> = {
  component: {
    value: "component",
    labelKey: "chip.kind.component.label",
    descriptionKey: "chip.kind.component.description",
    shapeKey: "chip.kind.component.shape",
    radius: "var(--chip-radius-component, 0.375em)",
  },
  pattern: {
    value: "pattern",
    labelKey: "chip.kind.pattern.label",
    descriptionKey: "chip.kind.pattern.description",
    shapeKey: "chip.kind.pattern.shape",
    radius: "var(--chip-radius-pattern, 1.25em)",
  },
  standard: {
    value: "standard",
    labelKey: "chip.kind.standard.label",
    descriptionKey: "chip.kind.standard.description",
    shapeKey: "chip.kind.standard.shape",
    radius: "var(--chip-radius-standard, 0)",
  },
  concept: {
    value: "concept",
    labelKey: "chip.kind.concept.label",
    descriptionKey: "chip.kind.concept.description",
    shapeKey: "chip.kind.concept.shape",
    radius: "var(--chip-radius-concept, 1em 0.25em)",
  },
  term: {
    value: "term",
    labelKey: "chip.kind.term.label",
    descriptionKey: "chip.kind.term.description",
    shapeKey: "chip.kind.term.shape",
    radius: "var(--chip-radius-term, 0.25em 1em)",
  },
  token: {
    value: "token",
    labelKey: "chip.kind.token.label",
    descriptionKey: "chip.kind.token.description",
    shapeKey: "chip.kind.token.shape",
    radius: "var(--chip-radius-token, 0 0.75em 0.75em 0)",
  },
};

/**
 * The border-vs-fill channel's encoding, one row per {@link BOXES} value,
 * each row's `value` equal to its key. The label and description are
 * catalog keys, read through `t()`; the weights are the tint's share of the
 * fill and of the stroke.
 */
export const BOX_INDEX: EncodingIndex<Box, BoxEncoding> = {
  class: {
    value: "class",
    labelKey: "chip.box.class.label",
    descriptionKey: "chip.box.class.description",
    fillWeight: "0%",
    strokeWeight: "80%",
  },
  instance: {
    value: "instance",
    labelKey: "chip.box.instance.label",
    descriptionKey: "chip.box.instance.description",
    fillWeight: "var(--chip-fill-weight-instance, 15%)",
    strokeWeight: "0%",
  },
};

/**
 * The status-dot channel's encoding, one row per {@link LIFECYCLES} value,
 * each row's `value` equal to its key. The label and description are
 * catalog keys, read through `t()`; `dot` is the dot's colour behind a
 * per-state theme hook, or `null` for `none`, which shows no dot.
 */
export const LIFECYCLE_INDEX: EncodingIndex<Lifecycle, LifecycleEncoding> = {
  canonical: {
    value: "canonical",
    labelKey: "chip.lifecycle.canonical.label",
    descriptionKey: "chip.lifecycle.canonical.description",
    dot: "var(--chip-dot-canonical, oklch(0.55 0.15 150))",
  },
  beta: {
    value: "beta",
    labelKey: "chip.lifecycle.beta.label",
    descriptionKey: "chip.lifecycle.beta.description",
    dot: "var(--chip-dot-beta, oklch(0.65 0.15 85))",
  },
  deprecated: {
    value: "deprecated",
    labelKey: "chip.lifecycle.deprecated.label",
    descriptionKey: "chip.lifecycle.deprecated.description",
    dot: "var(--chip-dot-deprecated, oklch(0.55 0.2 25))",
  },
  none: {
    value: "none",
    labelKey: "chip.lifecycle.none.label",
    descriptionKey: "chip.lifecycle.none.description",
    dot: null,
  },
};

/**
 * The legend's copy for each of the four channels, one row per
 * {@link CHANNELS} value, each row's `value` equal to its key; the label
 * and description are catalog keys, read through `t()`.
 */
export const CHANNEL_INDEX: EncodingIndex<Channel, ChannelDescriptor> = {
  namespace: {
    value: "namespace",
    labelKey: "chip.channel.namespace.label",
    descriptionKey: "chip.channel.namespace.description",
  },
  box: {
    value: "box",
    labelKey: "chip.channel.box.label",
    descriptionKey: "chip.channel.box.description",
  },
  kind: {
    value: "kind",
    labelKey: "chip.channel.kind.label",
    descriptionKey: "chip.channel.kind.description",
  },
  lifecycle: {
    value: "lifecycle",
    labelKey: "chip.channel.lifecycle.label",
    descriptionKey: "chip.channel.lifecycle.description",
  },
};

/**
 * The shape channel's rows in {@link KINDS} order, as the legend lists them.
 */
export const KIND_ENCODINGS: readonly KindEncoding[] = KINDS.map(
  (value) => KIND_INDEX[value],
);

/**
 * The border-vs-fill channel's rows in {@link BOXES} order, as the legend
 * lists them.
 */
export const BOX_ENCODINGS: readonly BoxEncoding[] = BOXES.map(
  (value) => BOX_INDEX[value],
);

/**
 * The status-dot channel's rows in {@link LIFECYCLES} order, as the legend
 * lists them.
 */
export const LIFECYCLE_ENCODINGS: readonly LifecycleEncoding[] = LIFECYCLES.map(
  (value) => LIFECYCLE_INDEX[value],
);

/**
 * The channels' legend copy in {@link CHANNELS} order, as the legend
 * presents it.
 */
export const CHANNEL_DESCRIPTORS: readonly ChannelDescriptor[] = CHANNELS.map(
  (value) => CHANNEL_INDEX[value],
);
