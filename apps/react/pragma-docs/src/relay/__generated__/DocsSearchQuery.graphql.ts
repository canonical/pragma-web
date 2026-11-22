/**
 * @generated SignedSource<<a822bb555ab76217f99ea8aef16c723a>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type DocsSearchQuery$variables = {
  after?: string | null | undefined;
  first?: number | null | undefined;
  hasPrevious?: boolean | null | undefined;
  previousFirst?: number | null | undefined;
  text: string;
  types?: ReadonlyArray<string> | null | undefined;
};
export type DocsSearchQuery$data = {
  readonly previous?: {
    readonly pageInfo: {
      readonly endCursor: string | null | undefined;
    };
  };
  readonly search: {
    readonly edges: ReadonlyArray<{
      readonly cursor: string;
      readonly match: {
        readonly passage: string;
        readonly ranges: ReadonlyArray<{
          readonly length: number;
          readonly start: number;
        }>;
      };
      readonly node: {
        readonly _meta: {
          readonly type: {
            readonly uri: string;
          };
        };
        readonly " $fragmentSpreads": FragmentRefs<"DocsChipProjection_node">;
      };
    }>;
    readonly facets: ReadonlyArray<{
      readonly count: number;
      readonly type: {
        readonly _meta: {
          readonly title: string;
        };
        readonly label: string | null | undefined;
        readonly uri: string;
      };
    }>;
    readonly pageInfo: {
      readonly endCursor: string | null | undefined;
      readonly hasNextPage: boolean;
    };
    readonly total: number;
  };
};
export type DocsSearchQuery = {
  response: DocsSearchQuery$data;
  variables: DocsSearchQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "after"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "first"
},
v2 = {
  "defaultValue": false,
  "kind": "LocalArgument",
  "name": "hasPrevious"
},
v3 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "previousFirst"
},
v4 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "text"
},
v5 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "types"
},
v6 = {
  "kind": "Variable",
  "name": "text",
  "variableName": "text"
},
v7 = {
  "kind": "Variable",
  "name": "types",
  "variableName": "types"
},
v8 = [
  {
    "kind": "Variable",
    "name": "after",
    "variableName": "after"
  },
  {
    "kind": "Variable",
    "name": "first",
    "variableName": "first"
  },
  (v6/*:: as any*/),
  (v7/*:: as any*/)
],
v9 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "total",
  "storageKey": null
},
v10 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "endCursor",
  "storageKey": null
},
v11 = {
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
      "name": "hasNextPage",
      "storageKey": null
    },
    (v10/*:: as any*/)
  ],
  "storageKey": null
},
v12 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "uri",
  "storageKey": null
},
v13 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "title",
  "storageKey": null
},
v14 = {
  "alias": null,
  "args": null,
  "concreteType": "TypeFacet",
  "kind": "LinkedField",
  "name": "facets",
  "plural": true,
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "count",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "OntologyClass",
      "kind": "LinkedField",
      "name": "type",
      "plural": false,
      "selections": [
        (v12/*:: as any*/),
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "label",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "concreteType": "EntityMeta",
          "kind": "LinkedField",
          "name": "_meta",
          "plural": false,
          "selections": [
            (v13/*:: as any*/)
          ],
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "storageKey": null
},
v15 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "cursor",
  "storageKey": null
},
v16 = [
  (v12/*:: as any*/)
],
v17 = {
  "alias": null,
  "args": null,
  "concreteType": "OntologyClass",
  "kind": "LinkedField",
  "name": "type",
  "plural": false,
  "selections": (v16/*:: as any*/),
  "storageKey": null
},
v18 = {
  "alias": null,
  "args": null,
  "concreteType": "SearchMatch",
  "kind": "LinkedField",
  "name": "match",
  "plural": false,
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "passage",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "MatchRange",
      "kind": "LinkedField",
      "name": "ranges",
      "plural": true,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "start",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "length",
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "storageKey": null
},
v19 = {
  "condition": "hasPrevious",
  "kind": "Condition",
  "passingValue": true,
  "selections": [
    {
      "alias": "previous",
      "args": [
        {
          "kind": "Variable",
          "name": "first",
          "variableName": "previousFirst"
        },
        (v6/*:: as any*/),
        (v7/*:: as any*/)
      ],
      "concreteType": "SearchConnection",
      "kind": "LinkedField",
      "name": "search",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "concreteType": "PageInfo",
          "kind": "LinkedField",
          "name": "pageInfo",
          "plural": false,
          "selections": [
            (v10/*:: as any*/)
          ],
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ]
},
v20 = [
  {
    "kind": "TypeDiscriminator",
    "abstractKey": "__isUIBlock"
  }
];
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*:: as any*/),
      (v1/*:: as any*/),
      (v2/*:: as any*/),
      (v3/*:: as any*/),
      (v4/*:: as any*/),
      (v5/*:: as any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "DocsSearchQuery",
    "selections": [
      {
        "alias": null,
        "args": (v8/*:: as any*/),
        "concreteType": "SearchConnection",
        "kind": "LinkedField",
        "name": "search",
        "plural": false,
        "selections": [
          (v9/*:: as any*/),
          (v11/*:: as any*/),
          (v14/*:: as any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": "SearchEdge",
            "kind": "LinkedField",
            "name": "edges",
            "plural": true,
            "selections": [
              (v15/*:: as any*/),
              {
                "alias": null,
                "args": null,
                "concreteType": null,
                "kind": "LinkedField",
                "name": "node",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "EntityMeta",
                    "kind": "LinkedField",
                    "name": "_meta",
                    "plural": false,
                    "selections": [
                      (v17/*:: as any*/)
                    ],
                    "storageKey": null
                  },
                  {
                    "args": null,
                    "kind": "FragmentSpread",
                    "name": "DocsChipProjection_node"
                  }
                ],
                "storageKey": null
              },
              (v18/*:: as any*/)
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      },
      (v19/*:: as any*/)
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v4/*:: as any*/),
      (v1/*:: as any*/),
      (v0/*:: as any*/),
      (v5/*:: as any*/),
      (v2/*:: as any*/),
      (v3/*:: as any*/)
    ],
    "kind": "Operation",
    "name": "DocsSearchQuery",
    "selections": [
      {
        "alias": null,
        "args": (v8/*:: as any*/),
        "concreteType": "SearchConnection",
        "kind": "LinkedField",
        "name": "search",
        "plural": false,
        "selections": [
          (v9/*:: as any*/),
          (v11/*:: as any*/),
          (v14/*:: as any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": "SearchEdge",
            "kind": "LinkedField",
            "name": "edges",
            "plural": true,
            "selections": [
              (v15/*:: as any*/),
              {
                "alias": null,
                "args": null,
                "concreteType": null,
                "kind": "LinkedField",
                "name": "node",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "__typename",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "EntityMeta",
                    "kind": "LinkedField",
                    "name": "_meta",
                    "plural": false,
                    "selections": [
                      (v17/*:: as any*/),
                      (v13/*:: as any*/),
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
                    "kind": "TypeDiscriminator",
                    "abstractKey": "__isNode"
                  },
                  (v12/*:: as any*/),
                  {
                    "kind": "InlineFragment",
                    "selections": (v20/*:: as any*/),
                    "type": "Component",
                    "abstractKey": null
                  },
                  {
                    "kind": "InlineFragment",
                    "selections": (v20/*:: as any*/),
                    "type": "Pattern",
                    "abstractKey": null
                  },
                  {
                    "kind": "InlineFragment",
                    "selections": (v20/*:: as any*/),
                    "type": "Layout",
                    "abstractKey": null
                  },
                  {
                    "kind": "InlineFragment",
                    "selections": [
                      {
                        "alias": null,
                        "args": [
                          {
                            "kind": "Literal",
                            "name": "first",
                            "value": 100
                          }
                        ],
                        "concreteType": "ModifierConnection",
                        "kind": "LinkedField",
                        "name": "modifiers",
                        "plural": false,
                        "selections": [
                          {
                            "alias": null,
                            "args": null,
                            "concreteType": "ModifierEdge",
                            "kind": "LinkedField",
                            "name": "edges",
                            "plural": true,
                            "selections": [
                              {
                                "alias": null,
                                "args": null,
                                "concreteType": "Modifier",
                                "kind": "LinkedField",
                                "name": "node",
                                "plural": false,
                                "selections": (v16/*:: as any*/),
                                "storageKey": null
                              }
                            ],
                            "storageKey": null
                          }
                        ],
                        "storageKey": "modifiers(first:100)"
                      }
                    ],
                    "type": "ModifierFamily",
                    "abstractKey": null
                  }
                ],
                "storageKey": null
              },
              (v18/*:: as any*/)
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      },
      (v19/*:: as any*/)
    ]
  },
  "params": {
    "cacheID": "1f8216fdc1581f6a816f1b32b5acfcd4",
    "id": null,
    "metadata": {},
    "name": "DocsSearchQuery",
    "operationKind": "query",
    "text": "query DocsSearchQuery(\n  $text: String!\n  $first: Int\n  $after: String\n  $types: [ID!]\n  $hasPrevious: Boolean = false\n  $previousFirst: Int\n) {\n  search(text: $text, first: $first, after: $after, types: $types) {\n    total\n    pageInfo {\n      hasNextPage\n      endCursor\n    }\n    facets {\n      count\n      type {\n        uri\n        label\n        _meta {\n          title\n        }\n      }\n    }\n    edges {\n      cursor\n      node {\n        __typename\n        _meta {\n          type {\n            uri\n          }\n        }\n        ...DocsChipProjection_node\n        uri\n      }\n      match {\n        passage\n        ranges {\n          start\n          length\n        }\n      }\n    }\n  }\n  previous: search(text: $text, first: $previousFirst, types: $types) @include(if: $hasPrevious) {\n    pageInfo {\n      endCursor\n    }\n  }\n}\n\nfragment CodeStandardChip_node on CodeStandard {\n  __typename\n  uri\n  _meta {\n    title\n    curie\n  }\n}\n\nfragment DocsChipProjection_node on Node {\n  __isNode: __typename\n  __typename\n  ...NodeChip_node\n  ...OntologyClassChip_node\n  ... on Component {\n    ...UIBlockChip_node\n  }\n  ... on Pattern {\n    ...UIBlockChip_node\n  }\n  ... on Layout {\n    ...UIBlockChip_node\n  }\n  ...ModifierChip_node\n  ...ModifierFamilyChip_node\n  ...CodeStandardChip_node\n}\n\nfragment ModifierChip_node on Modifier {\n  __typename\n  uri\n  _meta {\n    title\n    curie\n  }\n}\n\nfragment ModifierFamilyChip_node on ModifierFamily {\n  __typename\n  uri\n  _meta {\n    title\n    curie\n  }\n  modifiers(first: 100) {\n    edges {\n      node {\n        uri\n      }\n    }\n  }\n}\n\nfragment NodeChip_node on Node {\n  __isNode: __typename\n  __typename\n  uri\n  _meta {\n    title\n    curie\n  }\n}\n\nfragment OntologyClassChip_node on OntologyClass {\n  __typename\n  uri\n  _meta {\n    title\n    curie\n  }\n}\n\nfragment UIBlockChip_node on UIBlock {\n  __isUIBlock: __typename\n  __typename\n  uri\n  _meta {\n    title\n    curie\n  }\n}\n"
  }
};
})();

(node as any).hash = "312025af83bf3f1310609c985b9ff1aa";

export default node;
