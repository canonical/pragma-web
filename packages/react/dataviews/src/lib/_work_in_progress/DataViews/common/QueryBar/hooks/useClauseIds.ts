import { useDataViewsValue } from "../../../../../hooks/index.js";
import listChipClauses from "../listChipClauses.js";
import type { UseClauseIdsProps, UseClauseIdsResult } from "./types.js";

/** Two lists of clauses with the same ids, in the same order. */
const isSameIds = (a: UseClauseIdsResult, b: UseClauseIdsResult): boolean =>
  a.length === b.length &&
  a.every((clause, index) => clause.id === b.at(index)?.id);

/**
 * The bar's narrow read of its chips: the clauses it shows, held at one
 * identity while their ids stay, so a commit on one clause re-renders only
 * that clause's chip, which reads its own conjunct. An id names a
 * clause's address, so the held clauses point at what each chip reads.
 *
 * @param props - The query group.
 * @returns The chips' clauses.
 */
export default function useClauseIds({
  group,
}: UseClauseIdsProps): UseClauseIdsResult {
  return useDataViewsValue(group.state, listChipClauses, isSameIds);
}
