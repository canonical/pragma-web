import type { GroupTerm } from "../query/index.js";
import type { SourceRefusal } from "../result/index.js";
import createRefusal from "./createRefusal.js";
import pluralize from "./pluralize.js";
import type { GroupCapabilities } from "./types.js";

/**
 * List the refusals of a grouping: one when it nests deeper than the source
 * groups, and one per level naming no groupable field. A source that cannot
 * group at all says so once.
 */
export default function listGroupRefusals(
  declared: GroupCapabilities,
  group: readonly GroupTerm[],
): readonly SourceRefusal[] {
  const { levels } = declared;
  const depth =
    group.length > levels
      ? [
          createRefusal(
            "group",
            "too-many-levels",
            levels === 0
              ? "this source cannot group"
              : `this source groups by at most ${pluralize(levels, "level")}`,
          ),
        ]
      : [];
  const fields = (levels === 0 ? [] : group)
    .filter(({ field }) => !declared.fields.includes(field))
    .map(({ field }) =>
      createRefusal(
        "group",
        "undeclared-field",
        `field "${field}" cannot be grouped`,
        field,
      ),
    );
  return [...depth, ...fields];
}
