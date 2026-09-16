import type { DataTableColumn } from "../../types.js";

/**
 * The column heading each row, or null where none is declared, read where
 * the table mounts.
 *
 * A row has one name, so two columns declared its header fail here and are
 * both named. The one returned reads as never hideable, whatever it declared:
 * hiding the header would take the row's name with it.
 */
export default function readRowHeader(
  columns: readonly DataTableColumn[],
): DataTableColumn | null {
  const headers = columns.filter((column) => column.rowHeader === true);
  if (headers.length > 1) {
    const named = headers.map((column) => `"${column.id}"`).join(" and ");
    throw new Error(`columns ${named} are each the row header; a row has one`);
  }
  const header = headers[0];
  return header === undefined ? null : { ...header, hideable: false };
}
