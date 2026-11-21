import type { FetchFunction } from "relay-runtime";

const ONTOLOGIES = [
  { prefix: "metro", namespace: "https://metro.example/onto#" },
];

/** The stations' line, zone and kind facets, the line's counts in part. */
export const STATION_FACETS = [
  {
    field: "servesLine",
    label: "Line",
    values: [
      {
        value: "https://metro.example/onto#circle-line",
        label: "Circle Line",
        count: 6,
      },
      { value: null, label: null, count: 2 },
    ],
  },
  {
    field: "inZone",
    label: "Zone",
    values: [
      {
        value: "https://metro.example/onto#zone-1",
        label: "Zone 1",
        count: 14,
      },
    ],
  },
  {
    field: "kind",
    label: "Kind",
    values: [
      {
        value: "https://metro.example/onto#Station",
        label: "Station",
        count: 20,
      },
    ],
  },
] as const;

/**
 * Answer the index's two operations: the facet scope and the index, with
 * `facets` and one station.
 */
export const answerFacets =
  (facets: readonly object[]): FetchFunction =>
  async (request) => ({
    data:
      request.name === "EntityFacetScopeQuery"
        ? {
            ontologies: ONTOLOGIES,
            facetedInstances: {
              facets: facets.map((facet) => ({
                field: Reflect.get(facet, "field"),
              })),
            },
          }
        : {
            ontologies: ONTOLOGIES,
            ontologyClass: {
              uri: "https://metro.example/onto#Station",
              instanceCount: 26,
            },
            facetedInstances: {
              totalCount: 6,
              facets,
              edges: [
                {
                  cursor: "a",
                  node: {
                    __typename: "Station",
                    uri: "https://metro.example/onto#bank",
                    _meta: { title: "Bank", curie: "metro:bank" },
                  },
                },
              ],
              pageInfo: { endCursor: "a", hasNextPage: false },
            },
          },
  });
