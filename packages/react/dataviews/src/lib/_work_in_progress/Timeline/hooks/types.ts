import type { TimelineCollapsingMethod } from "../types.js";

/** What `useTimelineExpansion` takes: the events on the page, and how they collapse. */
export type UseTimelineExpansionProps = {
  /** How many events the page holds. */
  readonly count: number;
  readonly method?: TimelineCollapsingMethod | undefined;
  readonly initialVisible?: number | undefined;
  readonly step?: number | undefined;
};

/** What `useTimelineExpansion` answers: which events show, and the commands revealing the rest. */
export type UseTimelineExpansionResult = {
  /** The events shown above the indicator, under the `middle` method. */
  readonly topCount: number;
  /** The events shown after the top ones: below the indicator under `middle`, from the start otherwise. */
  readonly bottomCount: number;
  readonly hiddenCount: number;
  /** Where the indicator stands, or null while nothing is hidden. */
  readonly indicatorPosition: "bottom" | "middle" | null;
  /** How many events "show more" reveals. */
  readonly step: number;
  readonly showMore: () => void;
  readonly showAll: () => void;
};

/** One date written both ways: the form shown, and its alternate. */
export type FormattedDateTime = {
  readonly display: string;
  readonly alternate: string;
};

/**
 * What `useDateTimeFormats` answers: the form every event's date is shown
 * in, the command switching it, and the writing of one date. Its input is
 * positional — the formats a timeline was given — so it declares no props
 * type of its own.
 */
export type UseDateTimeFormatsResult = {
  readonly mode: "absolute" | "relative";
  /** Switches every event between the two forms, where the formats allow it. */
  readonly toggle: () => void;
  readonly toggleable: boolean;
  readonly tooltip: boolean;
  readonly format: (value: string) => FormattedDateTime;
};
