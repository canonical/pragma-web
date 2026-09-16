import { areListsEqual } from "@canonical/dataviews-core/bindings";
import { areFieldScopesEqual } from "../../../../utils/index.js";
import type { DataTableColumn } from "../../types.js";
import areColumnModelsEqual from "./areColumnModelsEqual.js";

/**
 * Whether two column arrays say the same thing about everything a body row
 * reads: the model, the types each column applies to, each column's own
 * content by reference and which column heads the row. The heading is left
 * out — no row or cell draws it — so a caller writing its headings as
 * inline elements re-renders the header row alone, never a row or a cell.
 */
export default function areBodyColumnsEqual(
  a: readonly DataTableColumn[],
  b: readonly DataTableColumn[],
): boolean {
  return (
    areColumnModelsEqual(a, b) &&
    areFieldScopesEqual(a, b) &&
    areListsEqual(
      a,
      b,
      (column, other) =>
        column.cell === other.cell && column.rowHeader === other.rowHeader,
    )
  );
}
