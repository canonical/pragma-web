/**
 * A declared label set as a heading or a summary: its first letter upper
 * case, the rest as the ontology declares it ("formations" reads
 * "Formations").
 *
 * @param label - The label as declared.
 * @returns The label in sentence case.
 */
export default function capitalizeLabel(label: string): string {
  const first = label.at(0);
  return first === undefined
    ? label
    : `${first.toLocaleUpperCase()}${label.slice(1)}`;
}
