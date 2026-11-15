import type {
  PredicateEdit,
  PredicateOperand,
  PredicateOperator,
  Schema,
  SchemaFieldDefinition,
  Slice,
} from "@canonical/dataviews-core";
import { foldText } from "@canonical/dataviews-core/bindings";
import compareBounds from "./compareBounds.js";
import placeConjuncts from "./placeConjuncts.js";
import type { PlacedConjunct, QueryContradiction } from "./types.js";

/** One field's conjuncts, by operator, each with its place. */
type FieldConjuncts = ReadonlyMap<PredicateOperator, readonly PlacedConjunct[]>;

/** Each field's conjuncts by operator, fields in canonical order. */
const listByField = (slice: Slice): ReadonlyMap<string, FieldConjuncts> => {
  const fields = new Map<string, Map<PredicateOperator, PlacedConjunct[]>>();
  for (const placed of placeConjuncts(slice)) {
    const { field, operator } = placed.ref;
    const operators =
      fields.get(field) ?? new Map<PredicateOperator, PlacedConjunct[]>();
    const held = operators.get(operator) ?? [];
    held.push(placed);
    operators.set(operator, held);
    fields.set(field, operators);
  }
  return fields;
};

/** An option as the schema matches it: by its text. */
const spellOption = (operand: PredicateOperand): string => String(operand);

/**
 * `isAny` conjuncts on a single-valued choice that share no option: a
 * record holds one option, so it cannot be in each set. The merge asks for
 * any option of any of them. A list-valued field holds several, so two
 * sets there ask for a record holding one of each, and never contradict.
 */
const findDisjointOptions = (
  field: string,
  conjuncts: FieldConjuncts,
  definition: SchemaFieldDefinition | undefined,
): QueryContradiction | null => {
  const sets = conjuncts.get("isAny") ?? [];
  if (
    definition?.kind !== "choices" ||
    definition.multiple === true ||
    sets.length < 2
  ) {
    return null;
  }
  // An option every set holds: a record holding it meets them all.
  const optionSets = sets.map(
    ({ predicate }) => new Set(predicate.operands.map(spellOption)),
  );
  const isShared = (operand: PredicateOperand): boolean =>
    optionSets.every((set) => set.has(spellOption(operand)));
  if (sets.some(({ predicate }) => predicate.operands.some(isShared))) {
    return null;
  }
  const union = new Map<string, PredicateOperand>();
  for (const { predicate } of sets) {
    for (const operand of predicate.operands) {
      union.set(spellOption(operand), operand);
    }
  }
  return {
    field,
    kind: "disjoint-options",
    refs: sets.map(({ ref }) => ref),
    merge: {
      remove: sets.map(({ ref }) => ref),
      add: [{ field, operator: "isAny", operands: [...union.values()] }],
    },
  };
};

/**
 * Text `is` conjuncts asking for two texts that differ once folded: a
 * value equals at most one. No merge: which text was meant is not known.
 */
const findDifferentText = (
  field: string,
  conjuncts: FieldConjuncts,
): QueryContradiction | null => {
  const equals = conjuncts.get("is") ?? [];
  const texts = new Set(
    equals.map(({ predicate }) => foldText(String(predicate.operands.at(0)))),
  );
  return texts.size < 2
    ? null
    : {
        field,
        kind: "different-text",
        refs: equals.map(({ ref }) => ref),
        merge: null,
      };
};

/**
 * The bound standing furthest in one direction, `1` for the highest and
 * `-1` for the lowest; the first of those tied, and none of an empty list.
 * A bound of another type than the first is never further: the schema
 * gives a field's bounds one type.
 */
const findOutermostBound = (
  bounds: readonly PlacedConjunct[],
  direction: 1 | -1,
): PlacedConjunct | undefined => {
  let outermost: PlacedConjunct | undefined;
  for (const bound of bounds) {
    if (
      outermost === undefined ||
      compareBounds(
        bound.predicate.operands.at(0),
        outermost.predicate.operands.at(0),
      ) === direction
    ) {
      outermost = bound;
    }
  }
  return outermost;
};

/**
 * The highest lower bound above the lowest upper bound: no value lies
 * between. Where the field holds one of each, the merge swaps them, which
 * reads as the range most likely meant; with more, no one swap resolves
 * them all.
 */
const findCrossedBounds = (
  field: string,
  conjuncts: FieldConjuncts,
): QueryContradiction | null => {
  const lowers = conjuncts.get("gte") ?? [];
  const uppers = conjuncts.get("lte") ?? [];
  const lower = findOutermostBound(lowers, 1);
  const upper = findOutermostBound(uppers, -1);
  if (lower === undefined || upper === undefined) {
    return null;
  }
  const lowest = lower.predicate.operands.at(0);
  const highest = upper.predicate.operands.at(0);
  if (compareBounds(lowest, highest) !== 1) {
    return null;
  }
  const refs = [lower.ref, upper.ref];
  const merge: PredicateEdit | null =
    lowers.length === 1 && uppers.length === 1
      ? {
          remove: refs,
          add: [
            { field, operator: "gte", operands: upper.predicate.operands },
            { field, operator: "lte", operands: lower.predicate.operands },
          ],
        }
      : null;
  return { field, kind: "crossed-bounds", refs, merge };
};

/**
 * `isSet` asked both ways: a field cannot both hold a value and hold none.
 * No merge: which was meant is not known.
 */
const findSetAndUnset = (
  field: string,
  conjuncts: FieldConjuncts,
): QueryContradiction | null => {
  const presence = conjuncts.get("isSet") ?? [];
  const unset = presence.filter(
    ({ predicate }) => predicate.operands.at(0) === false,
  );
  return unset.length === 0 || unset.length === presence.length
    ? null
    : {
        field,
        kind: "set-and-unset",
        refs: presence.map(({ ref }) => ref),
        merge: null,
      };
};

/**
 * The conjuncts of a slice that cannot all hold, field by field in
 * canonical order: `isAny` sets sharing no option on a single-valued
 * choice, text `is` asking for two different texts, a lower bound above an
 * upper bound, and `isSet` asked both ways. Each names its conjuncts and
 * the merge that resolves them, where one stands out: one set of every
 * option asked for, or a single crossed range's two bounds swapped. A
 * contradictory query still applies and matches nothing. Pure.
 */
export default function findContradictions(
  slice: Slice,
  schema: Schema<readonly SchemaFieldDefinition[]>,
): readonly QueryContradiction[] {
  const found: QueryContradiction[] = [];
  for (const [field, conjuncts] of listByField(slice)) {
    for (const contradiction of [
      findDisjointOptions(field, conjuncts, schema.findField(field)),
      findDifferentText(field, conjuncts),
      findCrossedBounds(field, conjuncts),
      findSetAndUnset(field, conjuncts),
    ]) {
      if (contradiction !== null) {
        found.push(contradiction);
      }
    }
  }
  return found;
}
