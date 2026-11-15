import type {
  RowRecord,
  SchemaFieldDefinition,
} from "@canonical/dataviews-core";
import type { ReactElement } from "react";
import { Announcer } from "../../common/index.js";
import { useAnnouncer, useMessages } from "../../hooks/index.js";
import { ScopedDataTable } from "../common/index.js";
import type { DataTableProps } from "./types.js";

/**
 * The data table presents structured data in rows and columns, with sorting,
 * row selection, inline editing, column management and grouping. It suits
 * application products where users work with medium to large datasets, and it
 * adapts across viewport sizes. Use it for machine inventories, user lists and
 * job histories, where users compare records attribute by attribute. Each of
 * its parts is documented as a separate subcomponent.
 *
 * This implementation renders one provider's rows as a native table, with
 * sorting, selection, resizing, column settings and optional
 * virtualization; no inline editing or grouping yet.
 *
 * `import { DataTable } from "@canonical/dataviews-react";`
 *
 * @implements ds:apps.pattern.datatable
 *
 * @experimental Pre-release: the whole surface is still settling, and this
 * name may change or move before the first release.
 */
export default function DataTable<
  TFields extends readonly SchemaFieldDefinition[],
  TRow extends object = RowRecord,
>({ messages, ...props }: DataTableProps<TFields, TRow>): ReactElement {
  const words = useMessages(messages);
  const { ref, announce } = useAnnouncer();
  return (
    <>
      <ScopedDataTable {...props} messages={words} announce={announce} />
      {/* Beside the table rather than in it: a table's children are its row
          groups. */}
      <Announcer ref={ref} />
    </>
  );
}
