import type {
  RowRecord,
  SchemaFieldDefinition,
} from "@canonical/dataviews-core";
import { type ReactElement, useEffect } from "react";
import { useDataViewsValue } from "../../../../hooks/index.js";
import type { PlainListProps } from "./types.js";

/**
 * The smallest renderer: one list item per row on the page, named by
 * `nameRecord`.
 *
 * It observes the provider for as long as it is mounted, which starts the
 * source, and reads the provider's row model, which re-renders it each time
 * the rows change.
 *
 * @experimental Pre-release: a tutorial example, not exported from the
 * package.
 */
export default function PlainList<
  TFields extends readonly SchemaFieldDefinition[],
  TRow extends object = RowRecord,
>({
  provider,
  label,
  nameRecord,
}: PlainListProps<TFields, TRow>): ReactElement {
  // The first observer starts the source; the cleanup stops observing.
  useEffect(() => provider.observe(), [provider]);
  const rows = useDataViewsValue(provider.rows);
  return (
    <ul aria-label={label}>
      {rows.entries.map((row) => (
        <li key={row.id}>{nameRecord(row.record)}</li>
      ))}
    </ul>
  );
}
