/**
 * @generated SignedSource<<749e2184f1b56a4de79b635320d894f7>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type DocsSearchQuery$variables = {
  after?: string | null | undefined;
  earlierFirst?: number | null | undefined;
  first?: number | null | undefined;
  hasEarlier?: boolean | null | undefined;
  hasPrevious?: boolean | null | undefined;
  previousFirst?: number | null | undefined;
  text: string;
  types?: ReadonlyArray<string> | null | undefined;
};
export type DocsSearchQuery$data = {
  readonly earlier?: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly _meta: {
          readonly type: {
            readonly uri: string;
          };
        };
      };
    }>;
  };
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
  "name": "earlierFirst"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "first"
},
v3 = {
  "defaultValue": false,
  "kind": "LocalArgument",
  "name": "hasEarlier"
},
v4 = {
  "defaultValue": false,
  "kind": "LocalArgument",
  "name": "hasPrevious"
},
v5 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "previousFirst"
},
v6 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "text"
},
v7 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "types"
},
v8 = {
  "kind": "Variable",
  "name": "text",
  "variableName": "text"
},
v9 = {
  "kind": "Variable",
  "name": "types",
  "variableName": "types"
},
v10 = [
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
  (v8/*:: as any*/),
  (v9/*:: as any*/)
],
v11 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "total",
  "storageKey": null
},
v12 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "endCursor",
  "storageKey": null
},
v13 = {
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
    (v12/*:: as any*/)
  ],
  "storageKey": null
},
v14 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "uri",
  "storageKey": null
},
v15 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "title",
  "storageKey": null
},
v16 = {
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
        (v14/*:: as any*/),
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
            (v15/*:: as any*/)
          ],
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "storageKey": null
},
v17 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "cursor",
  "storageKey": null
},
v18 = [
  (v14/*:: as any*/)
],
v19 = {
  "alias": null,
  "args": null,
  "concreteType": "OntologyClass",
  "kind": "LinkedField",
  "name": "type",
  "plural": false,
  "selections": (v18/*:: as any*/),
  "storageKey": null
},
v20 = {
  "alias": null,
  "args": null,
  "concreteType": "EntityMeta",
  "kind": "LinkedField",
  "name": "_meta",
  "plural": false,
  "selections": [
    (v19/*:: as any*/)
  ],
  "storageKey": null
},
v21 = {
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
v22 = [
  {
    "kind": "Variable",
    "name": "first",
    "variableName": "earlierFirst"
  },
  (v8/*:: as any*/),
  (v9/*:: as any*/)
],
v23 = {
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
        (v8/*:: as any*/),
        (v9/*:: as any*/)
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
            (v12/*:: as any*/)
          ],
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ]
},
v24 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "__typename",
  "storageKey": null
},
v25 = [
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
      (v5/*:: as any*/),
      (v6/*:: as any*/),
      (v7/*:: as any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "DocsSearchQuery",
    "selections": [
      {
        "alias": null,
        "args": (v10/*:: as any*/),
        "concreteType": "SearchConnection",
        "kind": "LinkedField",
        "name": "search",
        "plural": false,
        "selections": [
          (v11/*:: as any*/),
          (v13/*:: as any*/),
          (v16/*:: as any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": "SearchEdge",
            "kind": "LinkedField",
            "name": "edges",
            "plural": true,
            "selections": [
              (v17/*:: as any*/),
              {
                "alias": null,
                "args": null,
                "concreteType": null,
                "kind": "LinkedField",
                "name": "node",
                "plural": false,
                "selections": [
                  (v20/*:: as any*/),
                  {
                    "args": null,
                    "kind": "FragmentSpread",
                    "name": "DocsChipProjection_node"
                  }
                ],
                "storageKey": null
              },
              (v21/*:: as any*/)
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      },
      {
        "condition": "hasEarlier",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          {
            "alias": "earlier",
            "args": (v22/*:: as any*/),
            "concreteType": "SearchConnection",
            "kind": "LinkedField",
            "name": "search",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "SearchEdge",
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
                      (v20/*:: as any*/)
                    ],
                    "storageKey": null
                  }
                ],
                "storageKey": null
              }
            ],
            "storageKey": null
          }
        ]
      },
      (v23/*:: as any*/)
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v6/*:: as any*/),
      (v2/*:: as any*/),
      (v0/*:: as any*/),
      (v7/*:: as any*/),
      (v3/*:: as any*/),
      (v1/*:: as any*/),
      (v4/*:: as any*/),
      (v5/*:: as any*/)
    ],
    "kind": "Operation",
    "name": "DocsSearchQuery",
    "selections": [
      {
        "alias": null,
        "args": (v10/*:: as any*/),
        "concreteType": "SearchConnection",
        "kind": "LinkedField",
        "name": "search",
        "plural": false,
        "selections": [
          (v11/*:: as any*/),
          (v13/*:: as any*/),
          (v16/*:: as any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": "SearchEdge",
            "kind": "LinkedField",
            "name": "edges",
            "plural": true,
            "selections": [
              (v17/*:: as any*/),
              {
                "alias": null,
                "args": null,
                "concreteType": null,
                "kind": "LinkedField",
                "name": "node",
                "plural": false,
                "selections": [
                  (v24/*:: as any*/),
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "EntityMeta",
                    "kind": "LinkedField",
                    "name": "_meta",
                    "plural": false,
                    "selections": [
                      (v19/*:: as any*/),
                      (v15/*:: as any*/),
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
                  (v14/*:: as any*/),
                  {
                    "kind": "InlineFragment",
                    "selections": (v25/*:: as any*/),
                    "type": "Component",
                    "abstractKey": null
                  },
                  {
                    "kind": "InlineFragment",
                    "selections": (v25/*:: as any*/),
                    "type": "Pattern",
                    "abstractKey": null
                  },
                  {
                    "kind": "InlineFragment",
                    "selections": (v25/*:: as any*/),
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
                                "selections": (v18/*:: as any*/),
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
              (v21/*:: as any*/)
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      },
      {
        "condition": "hasEarlier",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          {
            "alias": "earlier",
            "args": (v22/*:: as any*/),
            "concreteType": "SearchConnection",
            "kind": "LinkedField",
            "name": "search",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "SearchEdge",
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
                      (v24/*:: as any*/),
                      (v20/*:: as any*/),
                      (v14/*:: as any*/)
                    ],
                    "storageKey": null
                  }
                ],
                "storageKey": null
              }
            ],
            "storageKey": null
          }
        ]
      },
      (v23/*:: as any*/)
    ]
  },
  "params": {
    "cacheID": "4affbccf2d9e4661d6d4e66ad9ed7a88",
    "id": null,
    "metadata": {},
    "name": "DocsSearchQuery",
    "operationKind": "query",
    "text": "query DocsSearchQuery(\n  $text: String!\n  $first: Int\n  $after: String\n  $types: [ID!]\n  $hasEarlier: Boolean = false\n  $earlierFirst: Int\n  $hasPrevious: Boolean = false\n  $previousFirst: Int\n) {\n  search(text: $text, first: $first, after: $after, types: $types) {\n    total\n    pageInfo {\n      hasNextPage\n      endCursor\n    }\n    facets {\n      count\n      type {\n        uri\n        label\n        _meta {\n          title\n        }\n      }\n    }\n    edges {\n      cursor\n      node {\n        __typename\n        _meta {\n          type {\n            uri\n          }\n        }\n        ...DocsChipProjection_node\n        uri\n      }\n      match {\n        passage\n        ranges {\n          start\n          length\n        }\n      }\n    }\n  }\n  earlier: search(text: $text, first: $earlierFirst, types: $types) @include(if: $hasEarlier) {\n    edges {\n      node {\n        __typename\n        _meta {\n          type {\n            uri\n          }\n        }\n        uri\n      }\n    }\n  }\n  previous: search(text: $text, first: $previousFirst, types: $types) @include(if: $hasPrevious) {\n    pageInfo {\n      endCursor\n    }\n  }\n}\n\nfragment CodeStandardChip_node on CodeStandard {\n  __typename\n  uri\n  _meta {\n    title\n    curie\n  }\n}\n\nfragment DocsChipProjection_node on Node {\n  __isNode: __typename\n  __typename\n  ...NodeChip_node\n  ...OntologyClassChip_node\n  ... on Component {\n    ...UIBlockChip_node\n  }\n  ... on Pattern {\n    ...UIBlockChip_node\n  }\n  ... on Layout {\n    ...UIBlockChip_node\n  }\n  ...ModifierChip_node\n  ...ModifierFamilyChip_node\n  ...CodeStandardChip_node\n}\n\nfragment ModifierChip_node on Modifier {\n  __typename\n  uri\n  _meta {\n    title\n    curie\n  }\n}\n\nfragment ModifierFamilyChip_node on ModifierFamily {\n  __typename\n  uri\n  _meta {\n    title\n    curie\n  }\n  modifiers(first: 100) {\n    edges {\n      node {\n        uri\n      }\n    }\n  }\n}\n\nfragment NodeChip_node on Node {\n  __isNode: __typename\n  __typename\n  uri\n  _meta {\n    title\n    curie\n  }\n}\n\nfragment OntologyClassChip_node on OntologyClass {\n  __typename\n  uri\n  _meta {\n    title\n    curie\n  }\n}\n\nfragment UIBlockChip_node on UIBlock {\n  __isUIBlock: __typename\n  __typename\n  uri\n  _meta {\n    title\n    curie\n  }\n}\n"
  }
};
})();

(node as any).hash = "b9ed8c8cb836eeefd7a4086be77d767c";

export default node;
