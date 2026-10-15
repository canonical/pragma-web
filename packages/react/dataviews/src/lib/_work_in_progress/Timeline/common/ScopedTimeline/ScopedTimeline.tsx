import type {
  DisplayStatus,
  RowRecord,
  SchemaFieldDefinition,
} from "@canonical/dataviews-core";
import {
  areDisplayStatusesEqual,
  isDataViewsProvider,
  listDisplayEntries,
  resolveDisplayStatus,
  resolveEffectiveOrdering,
} from "@canonical/dataviews-core/bindings";
import { type ReactElement, useCallback, useEffect, useMemo } from "react";
import { MessagesContext, StatusItem } from "../../../../common/index.js";
import {
  useDataViewsValue,
  useRowScopes,
  useStableCallback,
  useStableValue,
} from "../../../../hooks/index.js";
import { describeStatus } from "../../../../utils/index.js";
import { useDateTimeFormats, useTimelineHeader } from "../../hooks/index.js";
import type {
  TimelineDecoration,
  TimelineItem,
  TimelineSortOrder,
} from "../../types.js";
import {
  areMappingsEqual,
  mapRecord,
  resolveMarkerSizes,
} from "../../utils/index.js";
import { EventList, type NamedEvent } from "../EventList/index.js";
import { Header } from "../Header/index.js";
import { SelectAllOnPage } from "../SelectAllOnPage/index.js";
import type { ScopedTimelineProps } from "./types.js";

const componentCssClassName = "ds data-timeline";

/** The row scopes serve the select-all control alone, which observes no field. */
const NO_FIELDS: readonly string[] = [];

/**
 * The timeline itself, speaking through the announcer and the words of the
 * UI scope it is placed in: its own as a standalone `Timeline`, or a
 * `DataViews` root's.
 */
export default function ScopedTimeline<
  TFields extends readonly SchemaFieldDefinition[],
  TRow extends object = RowRecord,
>({
  provider,
  mapping,
  label,
  selectable = false,
  rowLabel,
  decorate,
  renderStatus,
  messages,
  announce,
  markerCombination = "all-sizes",
  dateTimePosition = "trailing",
  expansion = {},
  dateTimeFormats,
  showControls = true,
  showActorFilter = true,
  showEventFilter = true,
  showSorting = true,
  actorFilterLabel,
  eventFilterLabel,
  dateTimeLabel,
  trailing,
  renderItem,
  onVisibleItemsChange,
  className,
  ...rest
}: ScopedTimelineProps<TFields, TRow>): ReactElement {
  if (!isDataViewsProvider(provider)) {
    throw new Error(
      "Timeline requires a provider created by createDataViewsProvider",
    );
  }
  if (provider.collection.schema.findField(mapping.dateTime)?.kind !== "date") {
    throw new Error(
      `Timeline reads its dates from "${mapping.dateTime}", which is not a date field`,
    );
  }
  useEffect(() => provider.observe(), [provider]);
  const scopes = useRowScopes(provider, NO_FIELDS);
  const model = useDataViewsValue(provider.rows);
  const state = useDataViewsValue(provider.state);
  const status = useStableValue(
    resolveDisplayStatus(state),
    areDisplayStatusesEqual,
  );
  const mapped = useStableValue(mapping, areMappingsEqual);
  const decorateRow = useStableCallback(
    (row: TRow, rowId: string): TimelineDecoration =>
      decorate === undefined ? {} : decorate(row, rowId),
  );
  const nameRow = useStableCallback(
    (row: TRow, rowId: string): string | null =>
      rowLabel === undefined ? null : rowLabel(row, rowId),
  );
  const events = useMemo(() => {
    // The core keeps rows under a status that speaks about them and withholds them behind every other.
    const kept = listDisplayEntries({ rowIds: model.ids, status }).some(
      (entry) => entry.kind === "record",
    );
    const items = kept
      ? model.entries.map(({ id, record }): NamedEvent => {
          const item = mapRecord(record, id, mapped, decorateRow);
          return {
            ...item,
            name:
              nameRow(record, id) ?? item.description ?? item.eventLabel ?? id,
          };
        })
      : [];
    return resolveMarkerSizes(items, markerCombination);
  }, [model, status, mapped, decorateRow, nameRow, markerCombination]);
  const items = useMemo(() => events.map(({ item }) => item), [events]);
  const visible = useMemo(
    () => items.map(({ name: _name, ...item }): TimelineItem => item),
    [items],
  );
  const reportVisible = useStableCallback((shown: TimelineItem[]) => {
    onVisibleItemsChange?.(shown);
  });
  useEffect(() => {
    reportVisible(visible);
  }, [visible, reportVisible]);
  const lead = resolveEffectiveOrdering(
    state.slice,
    provider.capabilities.sort,
  ).terms.at(0);
  const order: TimelineSortOrder | null =
    lead?.field !== mapping.dateTime
      ? null
      : lead.direction === "desc"
        ? "newest"
        : "oldest";
  const isFiltered =
    state.slice.filter.length > 0 || (state.slice.search ?? "") !== "";
  const header = useTimelineHeader({
    provider,
    mapping: mapped,
    showActorFilter,
    showEventFilter,
    showSorting,
    actorFilterLabel: actorFilterLabel ?? messages.actorFilter,
    eventFilterLabel: eventFilterLabel ?? messages.eventFilter,
    dateTimeLabel: dateTimeLabel ?? messages.eventDate,
    items,
    messages,
    announce,
  });
  // A new page starts collapsed again; the same page refreshed keeps what was revealed.
  const page = useMemo(() => model.ids.join("\u0000"), [model]);
  const formats = useDateTimeFormats(dateTimeFormats);
  const describe = useCallback(
    (shown: DisplayStatus) => describeStatus(shown, messages),
    [messages],
  );
  const hasControls =
    showControls && (header.filters.length > 0 || header.order !== null);
  return (
    <MessagesContext value={messages}>
      <section
        {...rest}
        className={[
          componentCssClassName,
          trailing === undefined ? null : "has-trailing",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        aria-label={label}
        aria-busy={state.pendingRequestId !== null}
      >
        {hasControls ? <Header {...header} /> : null}
        {selectable ? (
          <SelectAllOnPage selection={provider.selection} ids={scopes.ids} />
        ) : null}
        {status === null ? null : (
          <StatusItem status={status} renderStatus={renderStatus ?? describe} />
        )}
        <EventList
          key={page}
          events={events}
          dateTimePosition={dateTimePosition}
          formats={formats}
          expansion={expansion}
          selection={selectable ? provider.selection : null}
          renderItem={renderItem ?? null}
          order={order}
          isFiltered={isFiltered}
        />
        {trailing === undefined ? null : (
          <div className="trailing">{trailing}</div>
        )}
      </section>
    </MessagesContext>
  );
}
