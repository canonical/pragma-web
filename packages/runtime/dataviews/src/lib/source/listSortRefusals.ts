import type { SortTerm } from "../query/index.js";
import type { SourceRefusal } from "../result/index.js";
import createRefusal from "./createRefusal.js";
import pluralize from "./pluralize.js";
import type { SortCapabilities } from "./types.js";

/**
 * List the refusals of an ordering: one when it has more terms than the
 * source orders by, and one per term naming no sortable field. A source
 * that cannot sort at all says so once, since every term would repeat it.
 */
export default function listSortRefusals(
  declared: SortCapabilities,
  sort: readonly SortTerm[],
): readonly SourceRefusal[] {
  const { terms } = declared;
  // A ceiling of zero is still a ceiling: one code covers both, so a
  // control reacts to "too many terms" without a second case.
  const arity =
    terms !== null && sort.length > terms
      ? [
          createRefusal(
            "sort",
            "too-many-terms",
            terms === 0
              ? "this source cannot sort"
              : `this source orders by at most ${pluralize(terms, "term")}`,
          ),
        ]
      : [];
  // Collected beside the arity refusal, not instead of it: an ordering over
  // a source's arity must not hide that one of its terms names no sortable
  // field either.
  const fields = (terms === 0 ? [] : sort)
    .filter(({ field }) => !declared.fields.includes(field))
    .map(({ field }) =>
      createRefusal(
        "sort",
        "undeclared-field",
        `field "${field}" cannot be sorted`,
        field,
      ),
    );
  return [...arity, ...fields];
}
