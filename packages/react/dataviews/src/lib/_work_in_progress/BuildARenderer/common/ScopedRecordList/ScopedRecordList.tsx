import type {
  RowRecord,
  SchemaFieldDefinition,
  SortDirection,
} from "@canonical/dataviews-core";
import {
  createRowScopes,
  listDisplayEntries,
  resolveDisplayStatus,
  resolveMessages,
} from "@canonical/dataviews-core/bindings";
import { type ReactElement, useEffect, useMemo, useState } from "react";
import { useDataViewsValue } from "../../../../hooks/index.js";
import { useIsScripted } from "../../hooks/index.js";
import { ListStatus } from "../ListStatus/index.js";
import { RecordItem } from "../RecordItem/index.js";
import type { ScopedRecordListProps } from "./types.js";

/** The row scopes observe no single field: each item reads its whole record. */
const NO_FIELDS: readonly string[] = [];

/**
 * The list over a scope it is handed: the status, a checkbox per record, and
 * a sort the source can run. It does not observe; whoever hands it the scope
 * does — the standalone list, or the DataViews root.
 *
 * @experimental Pre-release: a tutorial example, not exported from the
 * package.
 */
export default function ScopedRecordList<
  TFields extends readonly SchemaFieldDefinition[],
  TRow extends object = RowRecord,
>({
  scope,
  label,
  nameRecord,
  selectable = false,
  sortBy,
  messages,
}: ScopedRecordListProps<TFields, TRow>): ReactElement {
  const words = useMemo(() => resolveMessages(messages), [messages]);
  const scripted = useIsScripted();
  // One scope per row, built during render and observed from an effect, so
  // a render React throws away leaves nothing subscribed.
  const scopes = useMemo(
    () =>
      createRowScopes({
        rows: scope.rows,
        selection: scope.selection,
        fields: NO_FIELDS,
      }),
    [scope.rows, scope.selection],
  );
  useEffect(() => scopes.observe(), [scopes]);
  const state = useDataViewsValue(scope.state);
  const ids = useDataViewsValue(scopes.ids);
  const status = resolveDisplayStatus(state);
  const entries = listDisplayEntries({ rowIds: ids, status });
  // Why the last sort changed nothing, in the source's words.
  const [refused, setRefused] = useState<readonly string[] | null>(null);
  // Offer only what the source declares it can sort by.
  const sortable =
    sortBy !== undefined &&
    scope.capabilities.sort.fields.includes(sortBy.field);
  const applied = state.slice.sort.find(
    (term) => term.field === sortBy?.field,
  )?.direction;
  const sort = (field: string, direction: SortDirection): void => {
    const refusals = scope.setSort([{ field, direction }]);
    setRefused(
      refusals.length === 0 ? null : refusals.map(({ reason }) => reason),
    );
  };
  return (
    <section aria-label={label} aria-busy={state.pendingRequestId !== null}>
      {scripted && sortable ? (
        <fieldset>
          <legend>{sortBy.label}</legend>
          <button
            type="button"
            aria-pressed={applied === "asc"}
            onClick={() => sort(sortBy.field, "asc")}
          >
            {words.sortAscending}
          </button>
          <button
            type="button"
            aria-pressed={applied === "desc"}
            onClick={() => sort(sortBy.field, "desc")}
          >
            {words.sortDescending}
          </button>
          <p role="status">
            {refused === null ? null : words.sortRefused(refused)}
          </p>
        </fieldset>
      ) : null}
      {status === null ? null : <ListStatus status={status} messages={words} />}
      <ul>
        {entries.map((entry) =>
          entry.kind === "record" ? (
            <RecordItem
              key={entry.id}
              channels={scopes.readRow(entry.rowId)}
              selection={scope.selection}
              nameRecord={nameRecord}
              selectable={selectable && scripted}
              messages={words}
            />
          ) : null,
        )}
      </ul>
    </section>
  );
}
