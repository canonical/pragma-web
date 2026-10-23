/**
 * The chip encoding grammar — how a mention is decorated.
 *
 * A chip is a mention, not an entity: its identity is the graph node its URI
 * resolves to; everything visual about it is decoration derived from four
 * orthogonal channels, each carrying exactly one semantic dimension:
 *
 * 1. tint (colour)        → the namespace the entity belongs to
 * 2. border-vs-fill (box) → TBox class vs ABox instance
 * 3. shape                → the entity family (kind)
 * 4. status dot           → lifecycle
 *
 * The kind, box and lifecycle rows are tables (`constants.ts`); the tint is
 * computed from the site's own namespace prefixes, so no vocabulary is
 * hard-coded here. Both the renderer (`MentionChip`) and the legend
 * (`ChipLegend`) go through these functions, so the legend cannot drift from
 * behaviour. Every payload sits behind a `var(--mention-chip-…, fallback)`
 * hook: a theme restyles a channel by defining the hook without touching any
 * logic here; the fallbacks are the light values.
 *
 * Accepted WCAG 1.4.1 posture: the tint (and every other channel here) is
 * enrichment, not information — a chip's label and its `href` already carry
 * everything a reader must act on, so colour is never the sole means of
 * conveying anything actionable, and the same holds with styling ignored
 * entirely (the reads-as-text invariant). The one channel that is meaning
 * rather than decoration, lifecycle, does not rely on the dot's colour
 * either: `MentionChip` also folds the lifecycle word into
 * `aria-description`, so it reaches assistive tech alongside sighted readers.
 */

import {
  BOX_INDEX,
  GOLDEN_ANGLE_DEGREES,
  KIND_INDEX,
  LIFECYCLE_INDEX,
  TINT_CHROMA_FALLBACK,
  TINT_LIGHTNESS_FALLBACK,
  UNKNOWN_NAMESPACE_TINT,
} from "./constants.js";
import type {
  Box,
  BoxEncoding,
  EncodingIndex,
  EncodingRow,
  Kind,
  KindEncoding,
  Lifecycle,
  LifecycleEncoding,
  MentionChipChannelStyle,
  MentionChipChannelValues,
} from "./types.js";

/**
 * Asserts a value crossing a boundary is a non-empty string.
 *
 * @throws When `value` is not a string, or is empty.
 */
export function assertNonEmptyString(
  value: unknown,
  name: string,
): asserts value is string {
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`MentionChip: "${name}" must be a non-empty string`);
  }
}

/**
 * Row lookups are total over their typed vocabulary, and assert at runtime so
 * untyped content (MDX props, graph data) fails loudly, not with `undefined`.
 */
function getRow<Value extends string, Row extends EncodingRow<Value>>(
  index: EncodingIndex<Value, Row>,
  value: Value,
  channel: string,
): Row {
  const row: Row | undefined = index[value];
  if (row === undefined) {
    throw new Error(`MentionChip: unknown ${channel} "${value}"`);
  }
  return row;
}

/**
 * The shape channel's row for `kind`.
 *
 * @throws When `kind` is not a registered kind.
 */
export function getKindEncoding(kind: Kind): KindEncoding {
  return getRow(KIND_INDEX, kind, "kind");
}

/**
 * The border-vs-fill channel's row for `box`.
 *
 * @throws When `box` is not `class` or `instance`.
 */
export function getBoxEncoding(box: Box): BoxEncoding {
  return getRow(BOX_INDEX, box, "box");
}

/**
 * The status-dot channel's row for `lifecycle`.
 *
 * @throws When `lifecycle` is not a registered lifecycle.
 */
export function getLifecycleEncoding(lifecycle: Lifecycle): LifecycleEncoding {
  return getRow(LIFECYCLE_INDEX, lifecycle, "lifecycle");
}

/**
 * Derives the namespace from a prefixed URI: the text before its first `:`
 * (`ds:global.component.button` → `ds`). `undefined` when the URI has no
 * prefix. Whether the prefix is one the site knows is the tint's question,
 * not this one's.
 *
 * @throws When `uri` is empty.
 */
export function deriveNamespaceFromUri(uri: string): string | undefined {
  assertNonEmptyString(uri, "uri");
  const separator = uri.indexOf(":");
  return separator === -1 ? undefined : uri.slice(0, separator);
}

/**
 * The tint for `namespace`, from its place in `prefixes`.
 *
 * The hue steps by the golden angle per place, so the same list always tints
 * the same way, and a prefix appended to the list leaves every earlier
 * prefix's hue where it was. Lightness and chroma sit behind the
 * `--mention-chip-tint-l` / `--mention-chip-tint-c` theme hooks, shared by
 * every hue, so a theme moves all tints at once and the text-on-fill contrast
 * holds at every hue. A namespace that is absent, or not among `prefixes`,
 * gets the neutral unknown tint.
 */
export function resolveNamespaceTint(
  namespace: string | undefined,
  prefixes: readonly string[],
): string {
  const index = namespace === undefined ? -1 : prefixes.indexOf(namespace);
  if (index === -1) return UNKNOWN_NAMESPACE_TINT;
  const hue = Math.round(index * GOLDEN_ANGLE_DEGREES) % 360;
  return `oklch(var(--mention-chip-tint-l, ${TINT_LIGHTNESS_FALLBACK}) var(--mention-chip-tint-c, ${TINT_CHROMA_FALLBACK}) ${hue})`;
}

/**
 * Builds the per-chip custom properties from the channel values.
 * `MentionChip` sets these inline and the legend's swatches go through the
 * same path, so a row change repaints both — the cannot-drift property, by
 * construction.
 *
 * @throws When the kind, box or lifecycle is not registered.
 */
export function buildMentionChipChannelStyle(
  channels: MentionChipChannelValues,
): MentionChipChannelStyle {
  const { radius } = getKindEncoding(channels.kind);
  const { fillWeight, strokeWeight } = getBoxEncoding(channels.box);
  const { dot } = getLifecycleEncoding(channels.lifecycle);
  return {
    "--mention-chip-tint": resolveNamespaceTint(
      channels.namespace,
      channels.prefixes,
    ),
    "--mention-chip-radius": radius,
    "--mention-chip-fill-weight": fillWeight,
    "--mention-chip-stroke-weight": strokeWeight,
    "--mention-chip-dot": dot ?? "transparent",
  };
}
