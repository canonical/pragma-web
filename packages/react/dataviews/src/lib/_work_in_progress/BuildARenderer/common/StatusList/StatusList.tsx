import type {
  RowRecord,
  SchemaFieldDefinition,
} from "@canonical/dataviews-core";
import {
  listDisplayEntries,
  resolveDisplayStatus,
  resolveMessages,
} from "@canonical/dataviews-core/bindings";
import { type ReactElement, useEffect, useMemo } from "react";
import { useDataViewsValue } from "../../../../hooks/index.js";
import { ListStatus } from "../ListStatus/index.js";
import type { StatusListProps } from "./types.js";

/**
 * The first renderer, with the core's status: loading, failed, empty, no
 * match, and the failures that keep earlier rows in view.
 *
 * The core decides the status and which rows stay under it. The list draws
 * that answer: the status first, then the rows the entries keep.
 *
 * @experimental Pre-release: a tutorial example, not exported from the
 * package.
 */
export default function StatusList<
  TFields extends readonly SchemaFieldDefinition[],
  TRow extends object = RowRecord,
>({
  provider,
  label,
  nameRecord,
  messages,
}: StatusListProps<TFields, TRow>): ReactElement {
  useEffect(() => provider.observe(), [provider]);
  // English, with the application's messages over it.
  const words = useMemo(() => resolveMessages(messages), [messages]);
  const state = useDataViewsValue(provider.state);
  const rows = useDataViewsValue(provider.rows);
  // Null while the rows speak for themselves.
  const status = resolveDisplayStatus(state);
  // The status entry, if any, then one entry per row the status keeps.
  const entries = listDisplayEntries({ rowIds: rows.ids, status });
  const kept = new Set(
    entries.flatMap((entry) => (entry.kind === "record" ? [entry.rowId] : [])),
  );
  return (
    <section aria-label={label} aria-busy={state.pendingRequestId !== null}>
      {status === null ? null : <ListStatus status={status} messages={words} />}
      <ul>
        {rows.entries
          .filter((row) => kept.has(row.id))
          .map((row) => (
            <li key={row.id}>{nameRecord(row.record)}</li>
          ))}
      </ul>
    </section>
  );
}
