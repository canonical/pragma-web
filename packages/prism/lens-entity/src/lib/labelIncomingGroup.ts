import compactIri from "./compactIri.js";
import type { OntologyNamespace, StatementGroupLabels } from "./types.js";

/**
 * An incoming group's label, from the entity's side: the property's inverse
 * plural label for more than one value, else its inverse label; a property
 * with neither is named, through `nameInverse`, as what the entity is to
 * its holders, after the property's label or compact IRI. Never the
 * property's own reading, which names the holder's side.
 *
 * @param group - The group's predicate, its labels and its true count.
 * @param namespaces - The prefixes and namespaces the graph declares.
 * @param nameInverse - Words the entity's side around a property's label.
 * @returns The label "Referenced by" names the group by.
 */
export default function labelIncomingGroup(
  group: StatementGroupLabels,
  namespaces: readonly OntologyNamespace[],
  nameInverse: (label: string) => string,
): string {
  const { predicate } = group;
  return (
    (group.total > 1 ? predicate?.inversePluralLabel : undefined) ??
    predicate?.inverseLabel ??
    nameInverse(predicate?.label ?? compactIri(group.predicateUri, namespaces))
  );
}
