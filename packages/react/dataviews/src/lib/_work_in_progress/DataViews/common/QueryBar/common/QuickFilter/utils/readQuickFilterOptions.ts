import type { Predicate, PredicateOperand } from "@canonical/dataviews-core";
import type { PlacedConjunct } from "../../../types.js";
import type { QuickFilterWord } from "../types.js";

/** What one field's words are read from. */
type ReadQuickFilterOptionsConfig = {
  readonly field: string;
  /** The values the schema declares, in order. */
  readonly options: readonly PredicateOperand[];
  /** Whether several values apply at once, as checkboxes do. */
  readonly multiple: boolean;
  /** The field's conjuncts, as the query state holds them. */
  readonly conjuncts: readonly PlacedConjunct[];
  /** The word that applies no restriction, which leads one at a time. */
  readonly allLabel: string;
};

/** The field's values asked for any of, as one conjunct. */
const askAnyOf = (
  field: string,
  operands: readonly PredicateOperand[],
): Predicate => ({ field, operator: "isAny", operands });

/**
 * One field's words, each with whether the query holds its condition,
 * whether a none-of set excludes its value, and the edit choosing it makes.
 * A value is current while the field's first any-of set holds it. One
 * value at a time, "All" leads, current while the field holds no conjunct;
 * choosing it, or a value, replaces whatever the field holds, and choosing
 * what the field already holds alone makes no edit. Several at once, a
 * value toggles in the first any-of set, which goes once it is empty, and
 * including an excluded value lifts its exclusion in the same edit.
 * Derived from the query state, never stored. Pure.
 *
 * @param config - The field, its values and its conjuncts.
 * @returns The words, in order.
 */
export default function readQuickFilterOptions({
  field,
  options,
  multiple,
  conjuncts,
  allLabel,
}: ReadQuickFilterOptionsConfig): readonly QuickFilterWord[] {
  const anyOf = conjuncts.find(
    ({ ref }) => ref.operator === "isAny" && ref.nth === 0,
  );
  const held = anyOf?.predicate.operands ?? [];
  const excluded = new Set(
    conjuncts.flatMap(({ ref, predicate }) =>
      ref.operator === "isNone" ? predicate.operands : [],
    ),
  );
  if (multiple) {
    return options.map((option) => {
      const isHeld = held.includes(option);
      const toggled = isHeld
        ? held.filter((operand) => operand !== option)
        : [...held, option];
      // Including an excluded value lifts its exclusion in the same edit.
      const excluding = isHeld
        ? []
        : conjuncts.filter(
            ({ ref, predicate }) =>
              ref.operator === "isNone" && predicate.operands.includes(option),
          );
      const lifted = excluding.flatMap(({ predicate }) => {
        const left = predicate.operands.filter((operand) => operand !== option);
        return left.length === 0 ? [] : [{ ...predicate, operands: left }];
      });
      return {
        value: option,
        label: String(option),
        current: isHeld,
        excluded: excluded.has(option),
        edit: {
          remove: [
            ...(anyOf === undefined ? [] : [anyOf.ref]),
            ...excluding.map(({ ref }) => ref),
          ],
          add: [
            ...(toggled.length === 0 ? [] : [askAnyOf(field, toggled)]),
            ...lifted,
          ],
        },
      };
    });
  }
  const every = conjuncts.map(({ ref }) => ref);
  // The one value the field holds alone, which choosing again changes nothing.
  const only =
    conjuncts.length === 1 && held.length === 1 ? held.at(0) : undefined;
  return [
    {
      value: null,
      label: allLabel,
      current: conjuncts.length === 0,
      excluded: false,
      edit: conjuncts.length === 0 ? null : { remove: every, add: [] },
    },
    ...options.map((option) => ({
      value: option,
      label: String(option),
      current: held.includes(option),
      excluded: excluded.has(option),
      edit:
        only === option
          ? null
          : { remove: every, add: [askAnyOf(field, [option])] },
    })),
  ];
}
