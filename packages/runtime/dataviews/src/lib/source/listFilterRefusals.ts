import { addressPredicate, type Predicate } from "../query/index.js";
import type { SourceRefusal } from "../result/index.js";
import createRefusal from "./createRefusal.js";
import type { SourceCapabilities } from "./types.js";

/**
 * List the refusals of a filter: one per address whose field the source
 * cannot filter, or cannot filter with that operator, however many
 * conjuncts it holds. A field declared with no operator is a field not
 * declared.
 */
export default function listFilterRefusals(
  declared: SourceCapabilities["filter"],
  filter: readonly Predicate[],
): readonly SourceRefusal[] {
  const addresses = new Map(
    filter.map((predicate) => [
      addressPredicate(predicate.field, predicate.operator),
      predicate,
    ]),
  );
  return [...addresses.values()].flatMap(
    ({ field, operator }): SourceRefusal[] => {
      const operators = Object.hasOwn(declared, field)
        ? declared[field]
        : undefined;
      if (operators === undefined || operators.length === 0) {
        return [
          createRefusal(
            "filter",
            "undeclared-field",
            `field "${field}" cannot be filtered`,
            field,
            operator,
          ),
        ];
      }
      return operators.includes(operator)
        ? []
        : [
            createRefusal(
              "filter",
              "undeclared-operator",
              `field "${field}" cannot be filtered with ${operator}`,
              field,
              operator,
            ),
          ];
    },
  );
}
