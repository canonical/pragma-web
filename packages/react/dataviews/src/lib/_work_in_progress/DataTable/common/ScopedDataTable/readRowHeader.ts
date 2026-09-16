import type { Collection } from "@canonical/dataviews-core";
import { readFieldName } from "../../../../utils/index.js";
import type { FieldScopes } from "../../../../utils/types.js";
import type { DataTableColumn } from "../../types.js";

/**
 * The column heading each row, or null where none is declared, read where
 * the table mounts.
 *
 * A row has one name, so two columns declared its header fail here and are
 * both named. A header must name every row, so a column whose scope — its
 * field's, or the fewer types it narrows to — leaves out a declared type
 * fails too: its cell in a row of that type would be the not-applicable
 * dash, and the row named by nothing. The one returned reads as never
 * hideable, whatever it declared: hiding the header would take the row's
 * name with it.
 */
export default function readRowHeader(
  columns: readonly DataTableColumn[],
  readScope: FieldScopes,
  types: Collection["types"],
): DataTableColumn | null {
  const headers = columns.filter((column) => column.rowHeader === true);
  if (headers.length > 1) {
    const named = headers.map((column) => `"${column.id}"`).join(" and ");
    throw new Error(
      `DataTable columns ${named} are each the row header; a row has one`,
    );
  }
  const header = headers.at(0);
  if (header === undefined) {
    return null;
  }
  // A scope naming every declared type leaves no row out; one naming fewer
  // does. A collection of one type has no scope to leave a row out by.
  const { scope } = readScope(header);
  if (scope !== null && types?.names.some((name) => !scope.includes(name))) {
    throw new Error(
      `DataTable column "${header.id}" is the row header, but its field "${readFieldName(header)}" does not apply to every record type`,
    );
  }
  return { ...header, hideable: false };
}
