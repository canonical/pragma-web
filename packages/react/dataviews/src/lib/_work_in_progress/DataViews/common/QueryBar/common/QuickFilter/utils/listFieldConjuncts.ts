import type { PlacedConjunct, QueryStateStandIn } from "../../../types.js";
import { placeConjuncts } from "../../../utils/index.js";

/**
 * The conjuncts the query state holds on one field, each with its place,
 * in canonical order: one quick filter's slice of the query. Pure.
 *
 * @param state - The query state.
 * @param field - The field.
 * @returns The field's conjuncts.
 */
export default function listFieldConjuncts(
  state: QueryStateStandIn,
  field: string,
): readonly PlacedConjunct[] {
  return placeConjuncts(state.slice).filter(
    ({ predicate }) => predicate.field === field,
  );
}
