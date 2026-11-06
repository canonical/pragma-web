import type { PresentationState } from "@canonical/dataviews-core";
import { resolveColumnArrangement } from "@canonical/dataviews-core/bindings";
import { useCallback } from "react";
import { useDataViewsValue } from "../../../hooks/index.js";
import { areColumnsEqual } from "../common/utils/index.js";
import type { DataTableColumn } from "../types.js";
import type {
  UseColumnArrangementProps,
  UseColumnArrangementResult,
} from "./types.js";

/**
 * The columns one table renders, as the provider's presentation arranges
 * them: in the stored order, less the hidden ones. The declared list is the
 * lowest layer — its order stands where nothing is stored, and every
 * column is shown — and a column declared `hideable: false` is never
 * hidden. Held at one reference while the visible columns are the same,
 * so a width change alone re-renders no header and re-mints no layout.
 */
export default function useColumnArrangement({
  presentation,
  columns,
}: UseColumnArrangementProps): UseColumnArrangementResult {
  // Rebuilt only with the declared columns, so it runs once per
  // publication of the presentation, and once per render that passes new
  // columns.
  const selectVisible = useCallback(
    (shown: PresentationState): readonly DataTableColumn[] =>
      resolveColumnArrangement(columns, shown.presentation)
        .filter(({ hidden }) => !hidden)
        .map(({ column }) => column),
    [columns],
  );
  return useDataViewsValue(presentation.state, selectVisible, areColumnsEqual);
}
