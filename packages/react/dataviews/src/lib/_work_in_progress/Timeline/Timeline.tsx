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
} from "@canonical/dataviews-core/bindings";
import { type ReactElement, useCallback, useEffect, useMemo } from "react";
import { MessagesContext, StatusItem } from "../../common/index.js";
import {
  useDataViewsValue,
  useMessages,
  useRowScopes,
  useStableCallback,
  useStableValue,
} from "../../hooks/index.js";
import { describeStatus } from "../../utils/index.js";
import { EventList, type NamedEvent, SelectAllOnPage } from "./common/index.js";
import { useDateTimeFormats } from "./hooks/index.js";
import type { TimelineDecoration, TimelineProps } from "./types.js";
import {
  areMappingsEqual,
  mapRecord,
  resolveMarkerSizes,
} from "./utils/index.js";
import "./styles.css";

const componentCssClassName = "ds data-timeline";

/** The row scopes serve the select-all control alone, which observes no field. */
const NO_FIELDS: readonly string[] = [];

/**
 * A timeline renders the records of one collection as events in time: one
 * event per record on the page, in the order the query puts them, each
 * marked on a shared axis. It renders records and nothing else — it does not
 * fetch, sort or page — and reads what the table reads: the query's rows,
 * the core's status and the selection, so a record selected on the timeline
 * is selected in every renderer on the provider.
 *
 * Each record is read through `mapping`; `dateTime` must name a `date`
 * field. A long page collapses behind a strip revealing the rest. Every word
 * comes from `messages`, over English.
 *
 * Not exported from the package root: a work-in-progress spike, imported from
 * its own module until it is admitted.
 *
 * @experimental Pre-release: a work-in-progress spike, not admitted to the
 * package root; its shape may change or it may be withdrawn.
 */
export default function Timeline<
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
  markerCombination = "all-sizes",
  dateTimePosition = "trailing",
  expansion = {},
  dateTimeFormats,
  className,
  ...rest
}: TimelineProps<TFields, TRow>): ReactElement {
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
  const words = useMessages(messages);
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
  // A new page starts collapsed again; the same page refreshed keeps what was revealed.
  const page = useMemo(() => model.ids.join("\u0000"), [model]);
  const formats = useDateTimeFormats(dateTimeFormats);
  const describe = useCallback(
    (shown: DisplayStatus) => describeStatus(shown, words),
    [words],
  );
  return (
    <MessagesContext value={words}>
      <section
        {...rest}
        className={[componentCssClassName, className].filter(Boolean).join(" ")}
        aria-label={label}
        aria-busy={state.pendingRequestId !== null}
      >
        {selectable ? (
          <SelectAllOnPage selection={provider.selection} ids={scopes.ids} />
        ) : null}
        {status === null ? null : (
          <StatusItem status={status} renderStatus={renderStatus ?? describe} />
        )}
        {events.length === 0 ? null : (
          <EventList
            key={page}
            events={events}
            dateTimePosition={dateTimePosition}
            formats={formats}
            expansion={expansion}
            selection={selectable ? provider.selection : null}
          />
        )}
      </section>
    </MessagesContext>
  );
}
