import { compactIri } from "@canonical/prism-contract";
import type { OntologyNamespace, StatementGroupLabels } from "./types.js";

/**
 * An incoming group's label, from the entity's side: the property's inverse
 * plural label for more than one value, else its inverse label; a property
 * with neither is named, through `nameInverse`, as what the entity is to
 * its holders, after the property's label or compact IRI. Never the
 * property's own reading, which names the holder's side. A declared label
 * is set through `caseLabel`; a compact IRI is kept as it is.
 *
 * @param group - The group's predicate, its labels and its true count.
 * @param namespaces - The prefixes and namespaces the graph declares.
 * @param nameInverse - Words the entity's side around a property's label.
 * @param caseLabel - Sets a declared label's case: a heading or a summary
 *   passes `capitalizeLabel`; by default the label is kept as declared.
 * @returns The label "Referenced by" names the group by.
 */
export default function labelIncomingGroup(
  group: StatementGroupLabels,
  namespaces: readonly OntologyNamespace[],
  nameInverse: (label: string) => string,
  caseLabel: (label: string) => string = keepLabel,
): string {
  const { predicate } = group;
  const inverse =
    (group.total > 1 ? predicate?.inversePluralLabel : undefined) ??
    predicate?.inverseLabel;
  if (inverse !== null && inverse !== undefined) return caseLabel(inverse);
  const label = predicate?.label;
  return nameInverse(
    label === null || label === undefined
      ? compactIri(group.predicateUri, namespaces)
      : caseLabel(label),
  );
}

/** A declared label as it is. */
function keepLabel(label: string): string {
  return label;
}
