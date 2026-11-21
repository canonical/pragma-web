import type {
  PartitionedGroup,
  PartitionGroup,
  PartitionMeta,
  StatementPartition,
} from "./types.js";

/**
 * The predicates whose values the header already shows: the class in the
 * status line, the name in the heading.
 */
const HEADER_PREDICATES: ReadonlySet<string> = new Set([
  "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
  "http://www.w3.org/2000/01/rdf-schema#label",
]);

/** The predicates the header's summary reads, the first one held winning. */
const SUMMARY_PREDICATES = {
  definition: "http://www.w3.org/2004/02/skos/core#definition",
  comment: "http://www.w3.org/2000/01/rdf-schema#comment",
} as const;

/**
 * Split an entity's outgoing statement groups as the entity page and the
 * details panel show them. The groups the header shows (the class, the
 * name, and the summary's predicate: the definition when the entity has
 * one, else the comment) are left out; the groups whose field the lens
 * marks prominent come first, in the provider's order; every other group
 * is a relation when it holds a node of a class that is not hidden, else
 * a group of values, each beside the lens's field for its predicate.
 *
 * @param groups - The entity's outgoing groups, in the provider's order.
 * @param meta - The entity's definition and its class's fields.
 * @returns The prominent groups, the groups of values and the relations.
 */
export default function partitionStatements<G extends PartitionGroup>(
  groups: readonly G[],
  meta: PartitionMeta,
): StatementPartition<G> {
  const fields = new Map(
    meta.fields.map((field) => [field.property.uri, field]),
  );
  const summary =
    meta.definition != null
      ? SUMMARY_PREDICATES.definition
      : SUMMARY_PREDICATES.comment;
  const shown = groups.filter(
    ({ predicateUri }) =>
      !HEADER_PREDICATES.has(predicateUri) && predicateUri !== summary,
  );
  const isProminent = (group: G): boolean =>
    fields.get(group.predicateUri)?.visibility === "PROMINENT";
  const rest = shown
    .filter((group) => !isProminent(group))
    .map(
      (group): PartitionedGroup<G> => ({
        group,
        field: fields.get(group.predicateUri),
      }),
    );
  return {
    prominent: shown.filter(isProminent),
    values: rest.filter(({ group }) => !isRelation(group)),
    relations: rest.filter(({ group }) => isRelation(group)),
  };
}

/** Whether a group holds a node of a class the graph shows. */
function isRelation(group: PartitionGroup): boolean {
  return group.values.some(
    ({ __typename, node }) =>
      __typename === "StatementNode" &&
      node?._meta.type.visibility !== "HIDDEN",
  );
}
