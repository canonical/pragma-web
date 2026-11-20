import { OPERATOR_ARITY } from "../query/index.js";
import type { KeyConjunct, ReadPredicate, RecordedConjunct } from "./types.js";

/**
 * The conjuncts read so far with one key's conjunct kept among them. A set
 * operator read under a second spelling of one conjunct — `status`,
 * `status__isAny` and `status__isAny__0` — is one conjunct, holding the
 * operands of each and read from each key. A second spelling of a conjunct
 * that carries one value repeats it, and is reported and ignored. Pure.
 */
export default function recordConjunct(
  filter: readonly ReadPredicate[],
  key: string,
  conjunct: KeyConjunct,
): RecordedConjunct {
  const { predicate, ordinal } = conjunct;
  const kept = filter.find(
    ({ predicate: candidate, ordinal: read }) =>
      candidate.field === predicate.field &&
      candidate.operator === predicate.operator &&
      read === ordinal,
  );
  if (kept === undefined) {
    return {
      filter: [...filter, { predicate, ordinal, keys: [key] }],
      issue: null,
      record: "added",
    };
  }
  if (OPERATOR_ARITY[predicate.operator] !== "many") {
    return {
      filter,
      issue: {
        parameter: key,
        field: predicate.field,
        code: "malformed",
        reason: `"${key}" repeats a conjunct that takes one value; it was ignored`,
      },
      record: "repeated",
    };
  }
  return {
    filter: filter.map((read) =>
      read === kept
        ? {
            predicate: {
              ...predicate,
              operands: [...kept.predicate.operands, ...predicate.operands],
            },
            ordinal,
            keys: [...kept.keys, key],
          }
        : read,
    ),
    issue: null,
    record: "merged",
  };
}
