import type { Schema, SchemaFieldDefinition } from "@canonical/dataviews-core";
import { readFieldName } from "../../../../utils/index.js";
import type { DataTableColumn } from "../../types.js";

/**
 * The column heading each row, or null where none is declared, read where
 * the table mounts.
 *
 * A row has one name, so two columns declared its header fail here and are
 * both named. A header must name every row, so a column over a field only
 * some record types carry, or one narrowed to fewer types itself, fails too:
 * its cell in a row of another type would be the not-applicable dash, and
 * the row named by nothing. The one returned reads as never hideable,
 * whatever it declared: hiding the header would take the row's name with it.
 */
export default function readRowHeader(
  columns: readonly DataTableColumn[],
  schema: Schema<readonly SchemaFieldDefinition[]>,
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
  const field = readFieldName(header);
  if (
    header.appliesTo !== undefined ||
    schema.findField(field)?.appliesTo !== undefined
  ) {
    throw new Error(
      `DataTable column "${header.id}" is the row header, but its field "${field}" does not apply to every record type`,
    );
  }
  return { ...header, hideable: false };
}
