import type { ModifierFamily } from "@canonical/ds-types";
import type { Snippet } from "svelte";
import type { SvelteHTMLElements } from "svelte/elements";

export type TimelineSortOrder = "newest" | "oldest";

export type TimelineDateTimePosition = "leading" | "trailing";

export type TimelineMarkerCombination =
  | "all-sizes"
  | "large-medium"
  | "large-small"
  | "medium-small"
  | "large"
  | "medium"
  | "small";

export type TimelineCollapsingMethod = "none" | "bottom" | "middle";

export type TimelineMarkerSize = "large" | "medium" | "small";

/** Marker graphic; first of customGraphic, imageUrl, icon, initials wins. */
export type TimelineMarker = {
  customGraphic?: Snippet;
  imageUrl?: string;
  alt?: string;
  icon?: Snippet;
  initials?: string;
  size?: TimelineMarkerSize;
};

/** One data-driven timeline event. */
export type TimelineItem = {
  /** Stable identity: `{#each}` key and expansion restore. */
  id: string;
  /**
   * ISO 8601 timestamp; drives sort and `<time datetime>`.
   *
   * @note Sorting by this through `Date.parse` is engine-dependent on
   * out-of-range dates and timezone-dependent on offsetless date-times.
   * Prefer offset-bearing forms.
   */
  dateTime: string;
  /** Filter key; also drives consecutive-run marker sizing. */
  actorId?: string;
  actorName?: string;
  /** Profile URL; marker and name become links. */
  actorLink?: string;
  /** Event-filter key. */
  eventType?: string;
  eventLabel?: string;
  description?: string;
  customContent?: Snippet;
  marker?: TimelineMarker;
  /** Only the marker and `customContent` render. */
  fullyCustom?: boolean;
  showName?: boolean;
  showDescription?: boolean;
  showDateTime?: boolean;
  criticality?: ModifierFamily<"criticality">;
};

export type TimelineFilterOption = { value: string; label: string };

export type TimelineFilterState = {
  actorId?: string;
  eventType?: string;
};

export type TimelineExpansion = {
  method?: TimelineCollapsingMethod;
  /** Default 8. */
  initialVisible?: number;
  /** Events revealed per "Show more". Default 4. */
  step?: number;
};

export type TimelineDateTimeFormatProps = {
  formatAbsolute?: (iso: string, locale: string) => string;
  formatRelative?: (iso: string, now: number, locale: string) => string;
  /** Click toggles absolute/relative for all events. Default true. */
  toggleable?: boolean;
  /** Hover tooltip shows the alternate format. Default true. */
  tooltip?: boolean;
};

export type TimelineRenderContext = {
  order: TimelineSortOrder;
  isVisible: boolean;
  isFiltered: boolean;
  markerSize: TimelineMarkerSize;
  index: number;
};

type BaseProps = SvelteHTMLElements["div"];

/**
 * Props for the Timeline component
 *
 * @implements ds:global.pattern.timeline
 */
export interface TimelineProps extends BaseProps {
  /** The Timeline.Content element (required). */
  children: Snippet;
}
