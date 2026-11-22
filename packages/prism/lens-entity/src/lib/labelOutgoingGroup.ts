import { compactIri } from "@canonical/prism-contract/browser";
import type { OntologyNamespace, StatementGroupLabels } from "./types.js";

/**
 * An outgoing group's label, from the holder's side: the property's plural
 * label for more than one value, else its label, set through `caseLabel`,
 * else its compact IRI, as it is.
 *
 * @param group - The group's predicate, its labels and its true count.
 * @param namespaces - The prefixes and namespaces the graph declares.
 * @param caseLabel - Sets a declared label's case: a heading or a summary
 *   passes `capitalizeLabel`; by default the label is kept as declared.
 * @returns The label a section or a fact names the group by.
 */
export default function labelOutgoingGroup(
  group: StatementGroupLabels,
  namespaces: readonly OntologyNamespace[],
  caseLabel: (label: string) => string = keepLabel,
): string {
  const { predicate } = group;
  const label =
    (group.total > 1 ? predicate?.pluralLabel : undefined) ?? predicate?.label;
  return label === null || label === undefined
    ? compactIri(group.predicateUri, namespaces)
    : caseLabel(label);
}

/** A declared label as it is. */
function keepLabel(label: string): string {
  return label;
}
