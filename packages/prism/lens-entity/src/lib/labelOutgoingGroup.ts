import compactIri from "./compactIri.js";
import type { OntologyNamespace, StatementGroupLabels } from "./types.js";

/**
 * An outgoing group's label, from the holder's side: the property's plural
 * label for more than one value, else its label, else its compact IRI.
 *
 * @param group - The group's predicate, its labels and its true count.
 * @param namespaces - The prefixes and namespaces the graph declares.
 * @returns The label a section or a fact names the group by.
 */
export default function labelOutgoingGroup(
  group: StatementGroupLabels,
  namespaces: readonly OntologyNamespace[],
): string {
  const { predicate } = group;
  return (
    (group.total > 1 ? predicate?.pluralLabel : undefined) ??
    predicate?.label ??
    compactIri(group.predicateUri, namespaces)
  );
}
