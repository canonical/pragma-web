/**
 * @generated SignedSource<<106f4fc592309dd8aa928505acf673bf>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type EntityIndex_query$data = {
  readonly facetedInstances: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly _meta: {
          readonly curie: string;
          readonly title: string;
        };
        readonly uri: string;
        readonly " $fragmentSpreads": FragmentRefs<"NodeList_node">;
      };
    }>;
    readonly facets: ReadonlyArray<{
      readonly field: string;
      readonly label: string;
      readonly values: ReadonlyArray<{
        readonly count: number;
        readonly label: string | null | undefined;
        readonly value: string | null | undefined;
      }>;
    }>;
    readonly totalCount: number;
  };
  readonly ontologies: ReadonlyArray<{
    readonly namespace: string;
    readonly prefix: string;
  }>;
  readonly ontologyClass: {
    readonly instanceCount: number;
    readonly uri: string;
  } | null | undefined;
  readonly " $fragmentType": "EntityIndex_query";
};
export type EntityIndex_query$key = {
  readonly " $data"?: EntityIndex_query$data;
  readonly " $fragmentSpreads": FragmentRefs<"EntityIndex_query">;
};

import EntityIndexPaginationQuery_graphql from './EntityIndexPaginationQuery.graphql';

const node: ReaderFragment = (function(){
var v0 = [
  "facetedInstances"
],
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "uri",
  "storageKey": null
},
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "label",
  "storageKey": null
};
return {
  "argumentDefinitions": [
    {
      "defaultValue": null,
      "kind": "LocalArgument",
      "name": "classId"
    },
    {
      "defaultValue": null,
      "kind": "LocalArgument",
      "name": "classUri"
    },
    {
      "defaultValue": null,
      "kind": "LocalArgument",
      "name": "count"
    },
    {
      "defaultValue": null,
      "kind": "LocalArgument",
      "name": "cursor"
    },
    {
      "defaultValue": null,
      "kind": "LocalArgument",
      "name": "filters"
    }
  ],
  "kind": "Fragment",
  "metadata": {
    "connection": [
      {
        "count": "count",
        "cursor": "cursor",
        "direction": "forward",
        "path": (v0/*:: as any*/)
      }
    ],
    "refetch": {
      "connection": {
        "forward": {
          "count": "count",
          "cursor": "cursor"
        },
        "backward": null,
        "path": (v0/*:: as any*/)
      },
      "fragmentPathInResult": [],
      "operation": EntityIndexPaginationQuery_graphql
    }
  },
  "name": "EntityIndex_query",
  "selections": [
    {
      "alias": null,
      "args": null,
      "concreteType": "Ontology",
      "kind": "LinkedField",
      "name": "ontologies",
      "plural": true,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "prefix",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "namespace",
          "storageKey": null
        }
      ],
      "storageKey": null
    },
    {
      "alias": null,
      "args": [
        {
          "kind": "Variable",
          "name": "uri",
          "variableName": "classUri"
        }
      ],
      "concreteType": "OntologyClass",
      "kind": "LinkedField",
      "name": "ontologyClass",
      "plural": false,
      "selections": [
        (v1/*:: as any*/),
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "instanceCount",
          "storageKey": null
        }
      ],
      "storageKey": null
    },
    {
      "alias": "facetedInstances",
      "args": [
        {
          "kind": "Variable",
          "name": "classUri",
          "variableName": "classId"
        },
        {
          "kind": "Variable",
          "name": "filters",
          "variableName": "filters"
        }
      ],
      "concreteType": "FacetedConnection",
      "kind": "LinkedField",
      "name": "__EntityIndex_facetedInstances_connection",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "totalCount",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "concreteType": "Facet",
          "kind": "LinkedField",
          "name": "facets",
          "plural": true,
          "selections": [
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "field",
              "storageKey": null
            },
            (v2/*:: as any*/),
            {
              "alias": null,
              "args": null,
              "concreteType": "FacetValue",
              "kind": "LinkedField",
              "name": "values",
              "plural": true,
              "selections": [
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "value",
                  "storageKey": null
                },
                (v2/*:: as any*/),
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "count",
                  "storageKey": null
                }
              ],
              "storageKey": null
            }
          ],
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "concreteType": "NodeEdge",
          "kind": "LinkedField",
          "name": "edges",
          "plural": true,
          "selections": [
            {
              "alias": null,
              "args": null,
              "concreteType": null,
              "kind": "LinkedField",
              "name": "node",
              "plural": false,
              "selections": [
                (v1/*:: as any*/),
                {
                  "alias": null,
                  "args": null,
                  "concreteType": "EntityMeta",
                  "kind": "LinkedField",
                  "name": "_meta",
                  "plural": false,
                  "selections": [
                    {
                      "alias": null,
                      "args": null,
                      "kind": "ScalarField",
                      "name": "title",
                      "storageKey": null
                    },
                    {
                      "alias": null,
                      "args": null,
                      "kind": "ScalarField",
                      "name": "curie",
                      "storageKey": null
                    }
                  ],
                  "storageKey": null
                },
                {
                  "args": null,
                  "kind": "FragmentSpread",
                  "name": "NodeList_node"
                },
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "__typename",
                  "storageKey": null
                }
              ],
              "storageKey": null
            },
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "cursor",
              "storageKey": null
            }
          ],
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "concreteType": "PageInfo",
          "kind": "LinkedField",
          "name": "pageInfo",
          "plural": false,
          "selections": [
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "endCursor",
              "storageKey": null
            },
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "hasNextPage",
              "storageKey": null
            }
          ],
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "type": "Query",
  "abstractKey": null
};
})();

(node as any).hash = "08848d03511152b68a7a42cde57852c8";

export default node;
