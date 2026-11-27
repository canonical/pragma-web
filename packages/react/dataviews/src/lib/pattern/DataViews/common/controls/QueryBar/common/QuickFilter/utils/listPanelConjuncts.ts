import type {
  PredicateOperator,
  SchemaFieldDefinition,
} from "@canonical/dataviews-core";
import type { PlacedConjunct } from "../../../types.js";

/** The addresses a bounded kind's panel has a control for. */
const BOUNDS: readonly PredicateOperator[] = ["gte", "lte"];

/** The address a presence's panel has a control for. */
const PRESENCE: readonly PredicateOperator[] = ["isSet"];

/**
 * The conjuncts at the addresses a field's panel has a control for, which
 * its form submits itself: a choice's first any-of or none-of set; the
 * lower and upper bound of a number or a date, and the value under each
 * text operator, each where the source offers it; a presence, where it is
 * offered. The control stands for the first at its address; a further one
 * there has no control and rides in the form's hidden fields at its own
 * place. Every other conjunct of the field rides there too. Pure.
 *
 * @param definition - The field.
 * @param conjuncts - The field's conjuncts, each with its place.
 * @param offered - The operators the source offers on the field.
 * @returns The conjuncts at the panel's addresses, each with its place.
 */
export default function listPanelConjuncts(
  definition: SchemaFieldDefinition,
  conjuncts: readonly PlacedConjunct[],
  offered: readonly PredicateOperator[],
): readonly PlacedConjunct[] {
  const operators: readonly PredicateOperator[] =
    definition.kind === "choices"
      ? conjuncts
          .filter(
            ({ ref }) => ref.operator === "isAny" || ref.operator === "isNone",
          )
          .slice(0, 1)
          .map(({ ref }) => ref.operator)
      : definition.kind === "text"
        ? offered
        : (definition.kind === "presence" ? PRESENCE : BOUNDS).filter(
            (operator) => offered.includes(operator),
          );
  return conjuncts.filter(({ ref }) => operators.includes(ref.operator));
}
