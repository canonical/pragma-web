import type {
  DataViewsMessages,
  DataViewsProvider,
  DisplayStatus,
  RowRecord,
  SchemaFieldDefinition,
} from "@canonical/dataviews-core";
import type { ModifierFamily } from "@canonical/ds-types";
import type { ComponentProps, ReactNode } from "react";

/**
 * The size of one event's marker on the timeline's axis.
 *
 * @experimental Pre-release: a work-in-progress spike, not admitted to the
 * package root; its shape may change or it may be withdrawn.
 */
export type TimelineMarkerSize = "large" | "medium" | "small";

/**
 * The marker sizes a timeline draws. A two-size combination gives the first
 * event of each run of one actor the larger size; `all-sizes` also gives the
 * first event of each run of one event type, within an actor's run, the
 * medium size.
 *
 * @experimental Pre-release: a work-in-progress spike, not admitted to the
 * package root; its shape may change or it may be withdrawn.
 */
export type TimelineMarkerCombination =
  | "all-sizes"
  | "large-medium"
  | "large-small"
  | "medium-small"
  | "large"
  | "medium"
  | "small";

/**
 * How a long page of events collapses: not at all, below its first events,
 * or between its first and last events.
 *
 * @experimental Pre-release: a work-in-progress spike, not admitted to the
 * package root; its shape may change or it may be withdrawn.
 */
export type TimelineCollapsingMethod = "none" | "bottom" | "middle";

/**
 * Whether an event's date leads its marker or trails its content.
 *
 * @experimental Pre-release: a work-in-progress spike, not admitted to the
 * package root; its shape may change or it may be withdrawn.
 */
export type TimelineDateTimePosition = "leading" | "trailing";

/**
 * The order a timeline's events stand in by their date.
 *
 * @experimental Pre-release: a work-in-progress spike, not admitted to the
 * package root; its shape may change or it may be withdrawn.
 */
export type TimelineSortOrder = "newest" | "oldest";

/**
 * The graphic marking one event. The first of `customGraphic`, `imageUrl`,
 * `icon` and `initials` given is drawn; a small marker draws none.
 *
 * @experimental Pre-release: a work-in-progress spike, not admitted to the
 * package root; its shape may change or it may be withdrawn.
 */
export type TimelineMarker = {
  readonly customGraphic?: ReactNode;
  /** Drawn only with `alt`; without it, the generic user icon is drawn. */
  readonly imageUrl?: string;
  readonly alt?: string;
  readonly icon?: ReactNode;
  readonly initials?: string;
  /** Overrides the size the marker combination gives the event. */
  readonly size?: TimelineMarkerSize;
};

/**
 * One event as the timeline draws it, mapped from one record.
 *
 * @experimental Pre-release: a work-in-progress spike, not admitted to the
 * package root; its shape may change or it may be withdrawn.
 */
export type TimelineItem = {
  /** The record's identity. */
  readonly id: string;
  /** The record's date value: a calendar date, or a date-time with an offset. */
  readonly dateTime: string;
  /** The actor's identity; consecutive events of one actor form a run. */
  readonly actorId?: string;
  readonly actorName?: string;
  /** Where the actor's name and marker link to. */
  readonly actorLink?: string;
  /** The event type's identity; consecutive events of one type form a run. */
  readonly eventType?: string;
  readonly eventLabel?: string;
  readonly description?: string;
  /** Drawn below the event's own row. */
  readonly customContent?: ReactNode;
  readonly marker?: TimelineMarker;
  /** Draw only the marker and `customContent`. */
  readonly fullyCustom?: boolean;
  readonly showName?: boolean;
  readonly showDescription?: boolean;
  readonly showDateTime?: boolean;
  readonly criticality?: ModifierFamily<"criticality">;
};

/**
 * What a timeline's `decorate` adds to an event mapped from a record:
 * anything but its identity and its date, which the record decides.
 *
 * @experimental Pre-release: a work-in-progress spike, not admitted to the
 * package root; its shape may change or it may be withdrawn.
 */
export type TimelineDecoration = Partial<Omit<TimelineItem, "id" | "dateTime">>;

/**
 * The record fields an event's parts are read from, by field name. Each value
 * is read as text; a field holding anything else leaves its part out.
 *
 * @experimental Pre-release: a work-in-progress spike, not admitted to the
 * package root; its shape may change or it may be withdrawn.
 */
export type TimelineFieldMapping = {
  /** A field of kind `date`. */
  readonly dateTime: string;
  readonly actorId?: string;
  readonly actorName?: string;
  readonly actorLink?: string;
  readonly eventType?: string;
  readonly eventLabel?: string;
  readonly description?: string;
};

/**
 * What `renderItem` is handed beside each event it draws.
 *
 * @experimental Pre-release: a work-in-progress spike, not admitted to the
 * package root; its shape may change or it may be withdrawn.
 */
export type TimelineRenderContext = {
  /** The order the date leads the ordering in, or null where it does not lead it. */
  readonly order: TimelineSortOrder | null;
  /** Whether the event is shown; only shown events are drawn. */
  readonly isVisible: boolean;
  /** Whether the query restricts the collection, by a filter or a search. */
  readonly isFiltered: boolean;
  readonly markerSize: TimelineMarkerSize;
  /** The event's position among the page's events. */
  readonly index: number;
  /** The record's selection checkbox where the events are selectable, or null. */
  readonly control: ReactNode;
};

/**
 * How a long page of events collapses, and how much each step reveals.
 *
 * @experimental Pre-release: a work-in-progress spike, not admitted to the
 * package root; its shape may change or it may be withdrawn.
 */
export type TimelineExpansion = {
  /** Defaults to `bottom`. */
  readonly method?: TimelineCollapsingMethod;
  /** The events shown before any is revealed. Defaults to 8. */
  readonly initialVisible?: number;
  /** The events each "show more" reveals. Defaults to 4. */
  readonly step?: number;
};

/**
 * How an event's date is written. The absolute form is the default; the
 * relative form is its alternate, shown in the tooltip and on toggling.
 *
 * @experimental Pre-release: a work-in-progress spike, not admitted to the
 * package root; its shape may change or it may be withdrawn.
 */
export type TimelineDateTimeFormats = {
  /** The BCP 47 locale dates are written in. Defaults to `en`. */
  readonly locale?: string;
  /**
   * The time zone a date-time is written in; the runtime's own when left
   * out. A server render passes it, so the server writes what the client
   * hydrates. A calendar date is written as the date it names in any zone.
   */
  readonly timeZone?: string;
  readonly formatAbsolute?: (value: string, locale: string) => string;
  readonly formatRelative?: (
    value: string,
    now: number,
    locale: string,
  ) => string;
  /** Activating a date switches every event between the two forms. Defaults to true. */
  readonly toggleable?: boolean;
  /** Hovering a date shows its alternate form. Defaults to true. */
  readonly tooltip?: boolean;
};

type OwnProps<
  TFields extends readonly SchemaFieldDefinition[],
  TRow extends object,
> = {
  /** The provider owning this collection's query, result and selection. */
  readonly provider: DataViewsProvider<TFields, TRow>;
  /** The record fields each event is read from; `dateTime` must name a `date` field. */
  readonly mapping: TimelineFieldMapping;
  /** The timeline's accessible name. */
  readonly label: string;
  /** Offer a checkbox on each event, and one selecting every event on the page, backed by the provider's selection. */
  readonly selectable?: boolean;
  /** Names one record, for its selection checkbox. Defaults to its event's description, label or identity. */
  readonly rowLabel?: (row: TRow, rowId: string) => string;
  /**
   * Adds to each mapped event — a marker, custom content, a criticality.
   * The latest one is always called; its identity alone maps nothing again.
   */
  readonly decorate?: (row: TRow, rowId: string) => TimelineDecoration;
  /** Replaces the default text of a status, as the core decided it. */
  readonly renderStatus?: (status: DisplayStatus) => ReactNode;
  /** The words the timeline renders, over English; the connected timeline takes its root's. */
  readonly messages?: Partial<DataViewsMessages>;
  /** Defaults to `all-sizes`. */
  readonly markerCombination?: TimelineMarkerCombination;
  /** Defaults to `trailing`. */
  readonly dateTimePosition?: TimelineDateTimePosition;
  /** How a long page collapses; `false` shows every event. Defaults to collapsing below the first 8. */
  readonly expansion?: TimelineExpansion | false;
  readonly dateTimeFormats?: TimelineDateTimeFormats;
  /** Always the last node, which the connector line runs on to. */
  readonly trailing?: ReactNode;
  /** Draws each event in full; null draws an empty item. */
  readonly renderItem?: (
    item: TimelineItem,
    context: TimelineRenderContext,
  ) => ReactNode;
  /** Called with the page's events whenever they change. */
  readonly onVisibleItemsChange?: (visible: TimelineItem[]) => void;
  /** Draw the control bar. Defaults to true. */
  readonly showControls?: boolean;
  /** Offer the actor filter, where the source can restrict and facet the actor. Defaults to true. */
  readonly showActorFilter?: boolean;
  /** Offer the event filter, where the source can restrict and facet the event type. Defaults to true. */
  readonly showEventFilter?: boolean;
  /** Offer the order control, where the source orders by the date. Defaults to true. */
  readonly showSorting?: boolean;
  /** The actor filter's label. Defaults to the messages' `actorFilter`. */
  readonly actorFilterLabel?: string;
  /** The event filter's label. Defaults to the messages' `eventFilter`. */
  readonly eventFilterLabel?: string;
  /** What the date is called where an ordering by it is said. Defaults to the messages' `eventDate`. */
  readonly dateTimeLabel?: string;
};

/**
 * Timeline props. The root is a `section` named by `label`, so it extends
 * native section props, less `children`, since its content is the records,
 * and `aria-label`, `aria-labelledby` and `aria-busy`, which it sets.
 *
 * @experimental Pre-release: a work-in-progress spike, not admitted to the
 * package root; its shape may change or it may be withdrawn.
 */
export type TimelineProps<
  TFields extends readonly SchemaFieldDefinition[],
  TRow extends object = RowRecord,
> = OwnProps<TFields, TRow> &
  Omit<
    ComponentProps<"section">,
    | keyof OwnProps<TFields, TRow>
    | "children"
    | "aria-label"
    | "aria-labelledby"
    | "aria-busy"
  >;
