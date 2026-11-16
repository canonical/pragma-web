import { listConjuncts } from "@canonical/dataviews-core/bindings";
import { memo, type ReactElement, useMemo } from "react";
import { useDataViewsValue } from "../../../../../../hooks/index.js";
import type { QueryBarDraft, QueryStateStandIn } from "../../types.js";
import { DraftChip } from "../DraftChip/index.js";
import type { QueryBarChipProps } from "./types.js";

/** What one reading of a clause says, as text to compare. */
const readKey = (reading: QueryBarDraft): string =>
  JSON.stringify(
    reading.kind === "search"
      ? reading.text
      : [reading.field, reading.operator, reading.operands],
  );

/** Two readings of one clause that say the same. */
const isSameReading = (
  a: QueryBarDraft | null,
  b: QueryBarDraft | null,
): boolean =>
  a === b || (a !== null && b !== null && readKey(a) === readKey(b));

/**
 * One applied clause's chip. It reads its own conjunct, or the search,
 * from the query state, so a commit on another clause renders nothing
 * here; while the session's Entry stands in it, it shows the edit instead.
 * Activating a part or removing the chip hands the bar the clause as it
 * applies.
 */
function QueryBarChip({
  clause,
  group,
  edit,
  onActivate,
  onRemove,
  onTypedChange,
  onEntryKeyDown,
}: QueryBarChipProps): ReactElement | null {
  const read = useMemo(() => {
    if (clause.kind === "search") {
      const origin = { id: clause.id, ref: null };
      return (state: QueryStateStandIn): QueryBarDraft | null => ({
        kind: "search",
        origin,
        text: state.slice.search ?? "",
      });
    }
    const [ref] = clause.refs;
    return (state: QueryStateStandIn): QueryBarDraft | null => {
      const conjunct = listConjuncts(state.slice, ref.field, ref.operator).at(
        ref.nth,
      );
      return conjunct === undefined
        ? null
        : {
            kind: "predicate",
            origin: { id: clause.id, ref, held: conjunct },
            field: conjunct.field,
            operator: conjunct.operator,
            operands: conjunct.operands,
          };
    };
  }, [clause]);
  const applied = useDataViewsValue(group.state, read, isSameReading);
  // A clause removed reads nothing until the bar drops its chip.
  if (applied === null) return null;
  return (
    <DraftChip
      id={clause.id}
      draft={edit?.draft ?? applied}
      part={edit?.part ?? null}
      typed={edit?.typed ?? ""}
      invalid={edit?.invalid ?? null}
      onActivate={(part) => onActivate(applied, part)}
      onRemove={() => onRemove(applied)}
      onTypedChange={onTypedChange}
      onEntryKeyDown={onEntryKeyDown}
    />
  );
}

export default memo(QueryBarChip);
