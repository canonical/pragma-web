import type { ComponentProps } from "react";
import type { MessageKey } from "../i18n/index.js";
import type { BOXES, CHANNELS, KINDS, LIFECYCLES } from "./constants.js";

/** Entity families (the shape channel's vocabulary). */
export type Kind = (typeof KINDS)[number];

/** TBox class vs ABox instance (the border-vs-fill channel's vocabulary). */
export type Box = (typeof BOXES)[number];

/** Lifecycle states (the status-dot channel's vocabulary). */
export type Lifecycle = (typeof LIFECYCLES)[number];

/** The four channels, in the order the legend presents them. */
export type Channel = (typeof CHANNELS)[number];

/**
 * Fields every encoding row shares; the legend reads its copy through the
 * catalog keys `labelKey` and `descriptionKey`.
 */
export interface EncodingRow<Value extends string> {
  readonly value: Value;
  readonly labelKey: MessageKey;
  readonly descriptionKey: MessageKey;
}

/**
 * Shape channel row: the catalog key of the shape's name and its
 * `border-radius` payload.
 */
export interface KindEncoding extends EncodingRow<Kind> {
  readonly shapeKey: MessageKey;
  readonly radius: string;
}

/**
 * Box channel row: `color-mix` percentages of the tint applied to the fill
 * and to the (always-present, so metrics never shift) 1px stroke. The
 * instance fill weight routes through a theme hook: a dark theme lowers it
 * so the tint-on-fill text contrast stays ≥ 4.5:1 AA.
 */
export interface BoxEncoding extends EncodingRow<Box> {
  readonly fillWeight: string;
  readonly strokeWeight: string;
}

/** Dot channel row: the dot colour, or `null` when no dot is shown. */
export interface LifecycleEncoding extends EncodingRow<Lifecycle> {
  readonly dot: string | null;
}

/** Legend copy for one channel: what dimension the decoration encodes. */
export type ChannelDescriptor = EncodingRow<Channel>;

/**
 * An index typed so every vocabulary value has exactly one row whose
 * `value` agrees with its key — totality is a compile error away from drift.
 */
export type EncodingIndex<
  Value extends string,
  Row extends EncodingRow<Value>,
> = {
  readonly [V in Value]: Row & { readonly value: V };
};

/** One value per channel — everything the decoration derives from. */
export interface ChipChannelValues {
  /** The namespace prefix, or `undefined` when the mention has none. */
  readonly namespace: string | undefined;
  readonly kind: Kind;
  readonly box: Box;
  readonly lifecycle: Lifecycle;
  /** The site's namespace prefixes, in the order that assigns their tints. */
  readonly prefixes: readonly string[];
}

/** The custom properties `styles.css` consumes, one channel each. */
export interface ChipChannelStyle {
  readonly "--chip-tint": string;
  readonly "--chip-radius": string;
  readonly "--chip-fill-weight": string;
  readonly "--chip-stroke-weight": string;
  readonly "--chip-dot": string;
}

type OwnProps = {
  /**
   * The graph URI the mention resolves to — the chip's identity, invariant
   * wherever the same entity is mentioned. E.g. `ds:global.component.button`.
   */
  readonly uri: string;
  /** Visible text. Ignored decoration aside, the chip reads as this text. */
  readonly label: string;
  /** Entity family — drives the shape channel. */
  readonly kind: Kind;
  /**
   * The site's namespace prefixes, in a stable order: the provider's
   * `ontologies { prefix }`. A prefix's place in the list picks its tint, so
   * the same list always tints the same way, and appending a prefix leaves
   * every earlier prefix's tint unchanged.
   */
  readonly prefixes: readonly string[];
  /**
   * Namespace — drives the tint channel. Defaults to the URI's prefix (the
   * text before its first `:`), so it only needs stating when the mention
   * should override its own URI. A namespace outside `prefixes` gets the
   * neutral unknown tint.
   */
  readonly namespace?: string;
  /**
   * TBox class vs ABox instance — drives the border-vs-fill channel.
   * Defaults to `instance`: a mention names a thing unless it says otherwise.
   */
  readonly box?: Box;
  /** Lifecycle — drives the status-dot channel. Defaults to `none` (no dot). */
  readonly lifecycle?: Lifecycle;
  /**
   * One-line definition exposed as the chip's `aria-description` (with the
   * lifecycle's catalog label folded in when asserted) and echoed as a
   * native `title` hover peek. Both are string attributes, so the chip
   * still reads as plain text.
   */
  readonly summary?: string;
};

/**
 * Props accepted by `Chip`. The root depends on `href`: with one the chip is
 * an `<a>` and takes the anchor's native props, without one it is an inert
 * `<span>` and takes the span's.
 *
 * The native `children` is excluded because the chip renders its `label`.
 */
export type ChipProps =
  | (OwnProps & {
      /** Landing URL: the noun's canonical home. */
      readonly href: string;
    } & Omit<ComponentProps<"a">, keyof OwnProps | "href" | "children">)
  | (OwnProps & {
      readonly href?: undefined;
    } & Omit<ComponentProps<"span">, keyof OwnProps | "href" | "children">);

/**
 * Props accepted by `ChipLegend`: the site's namespace prefixes, and the
 * native props of its `<div>` root.
 *
 * The native `children` is excluded because the legend renders its own
 * groups.
 */
export type ChipLegendProps = {
  /** The site's namespace prefixes, as `Chip` receives them. */
  readonly prefixes: readonly string[];
} & Omit<ComponentProps<"div">, "prefixes" | "children">;
