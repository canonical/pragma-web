import type { StandardArticle_outgoing$data } from "../../../__generated__/StandardArticle_outgoing.graphql.js";
import { CS_PREDICATES } from "./constants.js";
import type { StandardExample, StandardExamples } from "./types.js";

/** One outgoing group of a standard's statements. */
type OutgoingGroup = StandardArticle_outgoing$data["groups"][number];

/** One predicate's values inside an example. */
type NestedGroup = Extract<
  OutgoingGroup["values"][number],
  { readonly __typename: "StatementNested" }
>["groups"][number];

/**
 * Read the first literal of one predicate inside an example, or the empty
 * string when the example has none.
 */
const readNestedLiteral = (
  groups: readonly NestedGroup[],
  predicateUri: string,
): string => {
  const value = groups.find((group) => group.predicateUri === predicateUri)
    ?.values[0];
  return value?.__typename === "StatementLiteral" ? value.lexical : "";
};

/**
 * Read a standard's examples of one kind (`cs:do` or `cs:dont`) from its
 * outgoing statement groups: each example's description, language and
 * code, the code without the blank lines a Turtle long string opens and
 * closes with, and how many examples the graph holds, before the bound.
 *
 * @param groups - The standard's outgoing statement groups.
 * @param predicateUri - The absolute IRI of `cs:do` or `cs:dont`.
 * @returns The examples, in the provider's order, and their true count;
 *   none and 0 when the standard has no such example.
 */
export default function readExamples(
  groups: readonly OutgoingGroup[],
  predicateUri: string,
): StandardExamples {
  const group = groups.find((entry) => entry.predicateUri === predicateUri);
  if (group === undefined) return { examples: [], total: 0 };
  const examples = group.values.flatMap((value): StandardExample[] =>
    value.__typename === "StatementNested"
      ? [
          {
            description: readNestedLiteral(
              value.groups,
              CS_PREDICATES.description,
            ),
            language: readNestedLiteral(value.groups, CS_PREDICATES.language),
            code: readNestedLiteral(value.groups, CS_PREDICATES.code).replace(
              /^\s*\n|\s+$/g,
              "",
            ),
          },
        ]
      : [],
  );
  return { examples, total: group.total };
}
