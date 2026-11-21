import type {
  Count,
  DataViewsMessages,
  DataViewsProvider,
  SchemaFieldDefinition,
} from "@canonical/dataviews-core";
import type { ReactNode } from "react";
import type { AnnouncerTopic } from "../../../common/index.js";
import type { HeaderProps } from "../common/Header/index.js";
import type {
  TimelineCollapsingMethod,
  TimelineDateTimeFormats,
  TimelineFieldMapping,
  TimelineItem,
} from "../types.js";

/** What `useTimelineExpansion` takes: the events on the page, how they collapse, and how to reach past the page. */
export type UseTimelineExpansionProps = {
  /** How many events the page holds. */
  readonly count: number;
  readonly method?: TimelineCollapsingMethod | undefined;
  readonly initialVisible?: number | undefined;
  readonly step?: number | undefined;
  /**
   * Asks the collection for the events past the page, or null where the
   * page holds the last of them. Show more calls it once every event on the
   * page is revealed.
   */
  readonly requestMore?: (() => void) | null | undefined;
};

/** What `useTimelineExpansion` answers: which events show, and the commands revealing the rest. */
export type UseTimelineExpansionResult = {
  /** The events shown above the indicator, under the `middle` method. */
  readonly topCount: number;
  /** The events shown after the top ones: below the indicator under `middle`, from the start otherwise. */
  readonly bottomCount: number;
  readonly hiddenCount: number;
  /** Where the indicator stands, or null while nothing is hidden on the page or past it. */
  readonly indicatorPosition: "bottom" | "middle" | null;
  /** How many events "show more" reveals. */
  readonly step: number;
  /** Whether "show more" asks the collection for events past the page, every event on it being revealed. */
  readonly fetchesMore: boolean;
  readonly showMore: () => void;
  readonly showAll: () => void;
};

/** One date written both ways: the form shown, and its alternate. */
export type FormattedDateTime = {
  readonly display: string;
  readonly alternate: string;
};

/** What `useDateTimeFormats` takes: the formats a timeline was given, each member defaulted. */
export type UseDateTimeFormatsProps = TimelineDateTimeFormats;

/**
 * What `useDateTimeFormats` answers: the form every event's date is shown
 * in, the command switching it, and the writing of one date.
 */
export type UseDateTimeFormatsResult = {
  readonly mode: "absolute" | "relative";
  /** Switches every event between the two forms, where the formats allow it. */
  readonly toggle: () => void;
  readonly toggleable: boolean;
  readonly tooltip: boolean;
  readonly format: (value: string) => FormattedDateTime;
};

/** What `useTimelineHeader` takes: the provider, how its records read as events, and how to say an outcome. */
export type UseTimelineHeaderProps<
  TFields extends readonly SchemaFieldDefinition[],
  TRow extends object,
> = {
  readonly provider: DataViewsProvider<TFields, TRow>;
  readonly mapping: TimelineFieldMapping;
  readonly showActorFilter: boolean;
  readonly showEventFilter: boolean;
  readonly showSorting: boolean;
  readonly actorFilterLabel: string;
  readonly eventFilterLabel: string;
  readonly dateTimeLabel: string;
  /** The page's events, which name the values the filters offer. */
  readonly items: readonly TimelineItem[];
  readonly messages: DataViewsMessages;
  readonly announce: (message: ReactNode, topic?: AnnouncerTopic) => void;
};

/** What `useTimelineHeader` answers: the controls the source allows, wired to its query. */
export type UseTimelineHeaderResult = HeaderProps;

/** What `useTimelineReach` takes: the provider, the events on the page, and how many one step asks for. */
export type UseTimelineReachProps<
  TFields extends readonly SchemaFieldDefinition[],
  TRow extends object,
> = {
  readonly provider: DataViewsProvider<TFields, TRow>;
  /** How many events the page holds. */
  readonly count: number;
  /** How many more events one "show more" asks the collection for. */
  readonly step: number;
};

/** What `useTimelineReach` answers: how many events the collection holds, and the way to the next ones. */
export type UseTimelineReachResult = {
  /**
   * How many events the collection holds, as exactly as the source counts
   * them; the page's own count where nothing lies past it.
   */
  readonly total: Count;
  /**
   * Grows the window by one step from the collection's first event, or null
   * where the page holds the last of them.
   */
  readonly requestMore: (() => void) | null;
  /** Where the grown window is spelled for the location, or null without one. */
  readonly moreHref: string | null;
};
