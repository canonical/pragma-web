/**
 * The query for the statements `depth` blank nodes below `uri`: at depth 0
 * those whose subject is `uri`, below that those whose subject is a blank
 * node reached from `uri` through `depth` blank nodes in a row.
 *
 * @param uri - An absolute IRI already checked safe to send.
 * @param depth - How many blank nodes in a row lie between `uri` and the
 * statements' subject.
 * @returns A CONSTRUCT query.
 */
export const buildDescribeQuery = (uri: string, depth: number): string => {
  const nodes = [
    `<${uri}>`,
    ...Array.from({ length: depth }, (_, index) => `?b${index}`),
  ];
  const subject = nodes.at(-1);
  const steps = nodes
    .slice(1)
    .map(
      (node, index) =>
        `${nodes.at(index)} ?q${index} ${node} . FILTER(isBlank(${node}))`,
    );
  return `CONSTRUCT { ${subject} ?p ?o } WHERE { ${steps.join(" ")} ${subject} ?p ?o }`;
};
