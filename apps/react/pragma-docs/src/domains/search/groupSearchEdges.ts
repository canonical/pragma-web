/** What grouping reads of a result: its node's most specific class. */
interface GroupableEdge {
  readonly node: {
    readonly _meta: { readonly type: { readonly uri: string } };
  };
}

/** What grouping reads of a type facet: the class, its names and its count. */
interface GroupableFacet {
  readonly count: number;
  readonly type: {
    readonly uri: string;
    readonly label?: string | null;
    readonly _meta: { readonly title: string };
  };
}

/** One type's results on the page, under the type's name and total. */
export interface SearchGroup<TEdge> {
  readonly type: string;
  readonly title: string;
  readonly count: number;
  readonly edges: readonly TEdge[];
}

/**
 * Group a page of results by their type: the prominent type (the facet
 * with the most results) first, then the others by ascending count, each
 * under its facet's name and total. A type no facet names follows, under
 * its IRI, counted by its results on the page. A type with no result on
 * the page has no group.
 *
 * @param edges - The page's results, in rank order.
 * @param facets - The query's type facets, most first.
 * @returns The groups, each holding its results in rank order.
 */
export default function groupSearchEdges<TEdge extends GroupableEdge>(
  edges: readonly TEdge[],
  facets: readonly GroupableFacet[],
): readonly SearchGroup<TEdge>[] {
  const byType = new Map<string, TEdge[]>();
  for (const edge of edges) {
    const type = edge.node._meta.type.uri;
    byType.set(type, [...(byType.get(type) ?? []), edge]);
  }
  const [prominent, ...rest] = facets;
  const ordered =
    prominent === undefined
      ? []
      : [prominent, ...[...rest].sort((a, b) => a.count - b.count)];
  const named = ordered.flatMap(({ count, type }) => {
    const found = byType.get(type.uri);
    return found === undefined
      ? []
      : [
          {
            type: type.uri,
            title: type.label ?? type._meta.title,
            count,
            edges: found,
          },
        ];
  });
  const known = new Set(ordered.map(({ type }) => type.uri));
  const unnamed = [...byType]
    .filter(([type]) => !known.has(type))
    .map(([type, found]) => ({
      type,
      title: type,
      count: found.length,
      edges: found,
    }));
  return [...named, ...unnamed];
}
