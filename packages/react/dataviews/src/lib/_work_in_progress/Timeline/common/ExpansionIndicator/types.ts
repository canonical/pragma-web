import type { Count } from "@canonical/dataviews-core";

/**
 * Props of the strip standing for a timeline's hidden events: collapsed on
 * the page, or past it.
 *
 * Exempt from the native-prop extension convention: an internal part drawn
 * from the page's expansion, not forwarding a caller's native props.
 */
export type ExpansionIndicatorProps = {
  /** How many events are hidden, on the page and past it, as exactly as the source counts them. */
  readonly hidden: Count;
  /** How many events "show more" reveals; none offers no such command. */
  readonly step: number;
  readonly onShowMore: () => void;
  /** Reveals every event the page hides, or null where it hides none. */
  readonly onShowAll: (() => void) | null;
  /**
   * Where "show more" leads before scripts take over — the window grown by
   * one step — or null where it reveals the page's own events or there is no
   * location to lead to.
   */
  readonly moreHref: string | null;
  /** Whether scripts have taken over: a button, rather than a link. */
  readonly hydrated: boolean;
};
