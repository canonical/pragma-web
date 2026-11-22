/** What grouping reads of a result: its node's most specific class. */
interface GroupableEdge {
  readonly node: {
    readonly _meta: { readonly type: { readonly uri: string } };
  };
}

/** What ordering reads of a type facet: the class and its count. */
interface OrderableFacet {
  readonly count: number;
  readonly type: { readonly uri: string };
}

/** What grouping reads of a type facet: the class, its names and its count. */
interface GroupableFacet extends OrderableFacet {
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
  /** Whether the type had results on an earlier page. */
  readonly continued: boolean;
  readonly edges: readonly TEdge[];
}

/** What orders the groups and tells a continued one. */
export interface GroupSearchOptions {
  /** The site's prominent class, whose group comes first. */
  readonly prominent?: string;
  /** The types of the results on the earlier pages. */
  readonly earlier?: ReadonlySet<string>;
}

/**
 * Order a query's type facets: the site's prominent class first when it
 * has results, then the others by ascending count.
 *
 * @param facets - The query's type facets.
 * @param prominent - The site's prominent class.
 * @returns The facets in the page's order.
 */
export function orderSearchFacets<TFacet extends OrderableFacet>(
  facets: readonly TFacet[],
  prominent?: string,
): readonly TFacet[] {
  const first = facets.filter(({ type }) => type.uri === prominent);
  const rest = facets
    .filter(({ type }) => type.uri !== prominent)
    .sort((a, b) => a.count - b.count);
  return [...first, ...rest];
}

/**
 * Group a page of results by their type, in the order of
 * `orderSearchFacets`, each under its facet's name and total, marked
 * continued when the type had results on an earlier page. A type no facet
 * names follows, under its IRI, counted by its results on the page. A
 * type with no result on the page has no group.
 *
 * @param edges - The page's results, in rank order.
 * @param facets - The query's type facets.
 * @param options - The site's prominent class and the earlier pages' types.
 * @returns The groups, each holding its results in rank order.
 */
export default function groupSearchEdges<TEdge extends GroupableEdge>(
  edges: readonly TEdge[],
  facets: readonly GroupableFacet[],
  { prominent, earlier = new Set() }: GroupSearchOptions = {},
): readonly SearchGroup<TEdge>[] {
  const byType = new Map<string, TEdge[]>();
  for (const edge of edges) {
    const type = edge.node._meta.type.uri;
    byType.set(type, [...(byType.get(type) ?? []), edge]);
  }
  const ordered = orderSearchFacets(facets, prominent);
  const named = ordered.flatMap(({ count, type }) => {
    const found = byType.get(type.uri);
    return found === undefined
      ? []
      : [
          {
            type: type.uri,
            title: type.label ?? type._meta.title,
            count,
            continued: earlier.has(type.uri),
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
      continued: earlier.has(type),
      edges: found,
    }));
  return [...named, ...unnamed];
}
