import type { ListedNode } from "./types.js";

/**
 * The one type a list's nodes share, up to their superclasses: the first
 * of the nodes' own types that every node has, as its type or as one of
 * its type's superclasses. An interchange is a station, so stations and
 * interchanges list as stations; stations and lines share no listed type.
 *
 * @param nodes - The listed nodes, each with its type and the type's superclasses.
 * @returns The shared type's IRI, or null when the nodes are of more than one type or none.
 */
export default function findListedType(
  nodes: readonly ListedNode[],
): string | null {
  const lineages = nodes.map(
    ({ _meta: { type } }) =>
      new Set([type.uri, ...(type.superclasses ?? []).map(({ uri }) => uri)]),
  );
  const shared = nodes
    .map(({ _meta: { type } }) => type.uri)
    .find((uri) => lineages.every((lineage) => lineage.has(uri)));
  return shared ?? null;
}
