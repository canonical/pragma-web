/**
 * @generated SignedSource<<1f1f5312886c7899ff6a18d236f489ad>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ComponentEntityQuery$variables = {
  count: number;
  uri: string;
};
export type ComponentEntityQuery$data = {
  readonly component: {
    readonly _meta: {
      readonly curie: string;
      readonly fields: ReadonlyArray<{
        readonly group: {
          readonly order: number | null | undefined;
        } | null | undefined;
        readonly name: string;
        readonly order: number | null | undefined;
      }>;
    };
    readonly changeLogs: ReadonlyArray<{
      readonly __typename: "ChangeLogEntry";
    }>;
    readonly guidelines: string | null | undefined;
    readonly modifierFamilies: {
      readonly edges: ReadonlyArray<{
        readonly node: {
          readonly modifiers: {
            readonly edges: ReadonlyArray<{
              readonly __typename: "ModifierEdge";
            }>;
          };
          readonly uri: string;
        };
      }>;
    };
    readonly name: string | null | undefined;
    readonly tokenBindings: ReadonlyArray<{
      readonly __typename: "TokenBinding";
    }>;
    readonly uri: string;
    readonly usage: string | null | undefined;
    readonly version: string | null | undefined;
    readonly " $fragmentSpreads": FragmentRefs<"ComponentAnatomy_node" | "ComponentChanges_node" | "ComponentHeader_node" | "ComponentProperties_node" | "ComponentRelations_node" | "ComponentTokens_node" | "ComponentVariants_node">;
  } | null | undefined;
};
export type ComponentEntityQuery = {
  response: ComponentEntityQuery$data;
  variables: ComponentEntityQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "count"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "uri"
},
v2 = [
  {
    "kind": "Variable",
    "name": "uri",
    "variableName": "uri"
  }
],
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "uri",
  "storageKey": null
},
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "version",
  "storageKey": null
},
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "curie",
  "storageKey": null
},
v7 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "order",
  "storageKey": null
},
v8 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "usage",
  "storageKey": null
},
v9 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "guidelines",
  "storageKey": null
},
v10 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "__typename",
  "storageKey": null
},
v11 = [
  (v10/*:: as any*/)
],
v12 = [
  {
    "kind": "Variable",
    "name": "first",
    "variableName": "count"
  }
],
v13 = [
  {
    "kind": "Literal",
    "name": "first",
    "value": 100
  }
],
v14 = [
  {
    "kind": "Variable",
    "name": "count",
    "variableName": "count"
  }
],
v15 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "summary",
  "storageKey": null
},
v16 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "title",
  "storageKey": null
},
v17 = [
  {
    "alias": null,
    "args": null,
    "concreteType": "EntityMeta",
    "kind": "LinkedField",
    "name": "_meta",
    "plural": false,
    "selections": [
      (v16/*:: as any*/)
    ],
    "storageKey": null
  },
  (v4/*:: as any*/)
],
v18 = {
  "alias": null,
  "args": null,
  "concreteType": "EntityMeta",
  "kind": "LinkedField",
  "name": "_meta",
  "plural": false,
  "selections": [
    (v16/*:: as any*/),
    (v6/*:: as any*/),
    {
      "alias": null,
      "args": null,
      "concreteType": "OntologyClass",
      "kind": "LinkedField",
      "name": "type",
      "plural": false,
      "selections": (v17/*:: as any*/),
      "storageKey": null
    }
  ],
  "storageKey": null
},
v19 = {
  "kind": "InlineFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "isAbstract",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "definition",
      "storageKey": null
    }
  ],
  "type": "OntologyClass",
  "abstractKey": null
},
v20 = [
  {
    "kind": "Literal",
    "name": "first",
    "value": 1
  }
],
v21 = {
  "alias": null,
  "args": (v20/*:: as any*/),
  "concreteType": "TagConnection",
  "kind": "LinkedField",
  "name": "documentationStages",
  "plural": false,
  "selections": [
    {
      "alias": null,
      "args": null,
      "concreteType": "TagEdge",
      "kind": "LinkedField",
      "name": "edges",
      "plural": true,
      "selections": [
        {
          "alias": null,
          "args": null,
          "concreteType": "Tag",
          "kind": "LinkedField",
          "name": "node",
          "plural": false,
          "selections": (v17/*:: as any*/),
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "storageKey": "documentationStages(first:1)"
},
v22 = [
  {
    "kind": "InlineFragment",
    "selections": [
      (v15/*:: as any*/),
      (v21/*:: as any*/)
    ],
    "type": "UIBlock",
    "abstractKey": "__isUIBlock"
  }
],
v23 = {
  "kind": "InlineFragment",
  "selections": (v22/*:: as any*/),
  "type": "Component",
  "abstractKey": null
},
v24 = {
  "kind": "InlineFragment",
  "selections": (v22/*:: as any*/),
  "type": "Pattern",
  "abstractKey": null
},
v25 = {
  "kind": "InlineFragment",
  "selections": (v22/*:: as any*/),
  "type": "Layout",
  "abstractKey": null
},
v26 = {
  "kind": "InlineFragment",
  "selections": [
    (v15/*:: as any*/),
    {
      "alias": null,
      "args": null,
      "concreteType": "ModifierFamily",
      "kind": "LinkedField",
      "name": "modifierFamily",
      "plural": false,
      "selections": (v17/*:: as any*/),
      "storageKey": null
    }
  ],
  "type": "Modifier",
  "abstractKey": null
},
v27 = {
  "kind": "InlineFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "description",
      "storageKey": null
    },
    {
      "alias": null,
      "args": (v20/*:: as any*/),
      "concreteType": "CategoryConnection",
      "kind": "LinkedField",
      "name": "categories",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "concreteType": "CategoryEdge",
          "kind": "LinkedField",
          "name": "edges",
          "plural": true,
          "selections": [
            {
              "alias": null,
              "args": null,
              "concreteType": "Category",
              "kind": "LinkedField",
              "name": "node",
              "plural": false,
              "selections": (v17/*:: as any*/),
              "storageKey": null
            }
          ],
          "storageKey": null
        }
      ],
      "storageKey": "categories(first:1)"
    }
  ],
  "type": "CodeStandard",
  "abstractKey": null
},
v28 = {
  "kind": "InlineFragment",
  "selections": [
    (v15/*:: as any*/),
    {
      "alias": null,
      "args": (v13/*:: as any*/),
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
              "selections": [
                (v4/*:: as any*/)
              ],
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
},
v29 = [
  {
    "alias": null,
    "args": null,
    "concreteType": "UIBlockEdge",
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
          (v10/*:: as any*/),
          (v4/*:: as any*/),
          {
            "kind": "InlineFragment",
            "selections": [
              (v18/*:: as any*/),
              (v19/*:: as any*/),
              (v23/*:: as any*/),
              (v24/*:: as any*/),
              (v25/*:: as any*/),
              (v26/*:: as any*/),
              (v28/*:: as any*/),
              (v27/*:: as any*/)
            ],
            "type": "Node",
            "abstractKey": "__isNode"
          }
        ],
        "storageKey": null
      }
    ],
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*:: as any*/),
      (v1/*:: as any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "ComponentEntityQuery",
    "selections": [
      {
        "alias": null,
        "args": (v2/*:: as any*/),
        "concreteType": "Component",
        "kind": "LinkedField",
        "name": "component",
        "plural": false,
        "selections": [
          (v3/*:: as any*/),
          (v4/*:: as any*/),
          (v5/*:: as any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": "EntityMeta",
            "kind": "LinkedField",
            "name": "_meta",
            "plural": false,
            "selections": [
              (v6/*:: as any*/),
              {
                "alias": null,
                "args": null,
                "concreteType": "ClassProperty",
                "kind": "LinkedField",
                "name": "fields",
                "plural": true,
                "selections": [
                  (v3/*:: as any*/),
                  (v7/*:: as any*/),
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "PropertyGroup",
                    "kind": "LinkedField",
                    "name": "group",
                    "plural": false,
                    "selections": [
                      (v7/*:: as any*/)
                    ],
                    "storageKey": null
                  }
                ],
                "storageKey": null
              }
            ],
            "storageKey": null
          },
          (v8/*:: as any*/),
          (v9/*:: as any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": "ChangeLogEntry",
            "kind": "LinkedField",
            "name": "changeLogs",
            "plural": true,
            "selections": (v11/*:: as any*/),
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "TokenBinding",
            "kind": "LinkedField",
            "name": "tokenBindings",
            "plural": true,
            "selections": (v11/*:: as any*/),
            "storageKey": null
          },
          {
            "alias": null,
            "args": (v12/*:: as any*/),
            "concreteType": "ModifierFamilyConnection",
            "kind": "LinkedField",
            "name": "modifierFamilies",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "ModifierFamilyEdge",
                "kind": "LinkedField",
                "name": "edges",
                "plural": true,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "ModifierFamily",
                    "kind": "LinkedField",
                    "name": "node",
                    "plural": false,
                    "selections": [
                      (v4/*:: as any*/),
                      {
                        "alias": null,
                        "args": (v13/*:: as any*/),
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
                            "selections": (v11/*:: as any*/),
                            "storageKey": null
                          }
                        ],
                        "storageKey": "modifiers(first:100)"
                      }
                    ],
                    "storageKey": null
                  }
                ],
                "storageKey": null
              }
            ],
            "storageKey": null
          },
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "ComponentHeader_node"
          },
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "ComponentAnatomy_node"
          },
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "ComponentProperties_node"
          },
          {
            "args": (v14/*:: as any*/),
            "kind": "FragmentSpread",
            "name": "ComponentRelations_node"
          },
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "ComponentChanges_node"
          },
          {
            "args": (v14/*:: as any*/),
            "kind": "FragmentSpread",
            "name": "ComponentVariants_node"
          },
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "ComponentTokens_node"
          }
        ],
        "storageKey": null
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v1/*:: as any*/),
      (v0/*:: as any*/)
    ],
    "kind": "Operation",
    "name": "ComponentEntityQuery",
    "selections": [
      {
        "alias": null,
        "args": (v2/*:: as any*/),
        "concreteType": "Component",
        "kind": "LinkedField",
        "name": "component",
        "plural": false,
        "selections": [
          (v3/*:: as any*/),
          (v4/*:: as any*/),
          (v5/*:: as any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": "EntityMeta",
            "kind": "LinkedField",
            "name": "_meta",
            "plural": false,
            "selections": [
              (v6/*:: as any*/),
              {
                "alias": null,
                "args": null,
                "concreteType": "ClassProperty",
                "kind": "LinkedField",
                "name": "fields",
                "plural": true,
                "selections": [
                  (v3/*:: as any*/),
                  (v7/*:: as any*/),
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "PropertyGroup",
                    "kind": "LinkedField",
                    "name": "group",
                    "plural": false,
                    "selections": [
                      (v7/*:: as any*/),
                      (v4/*:: as any*/)
                    ],
                    "storageKey": null
                  }
                ],
                "storageKey": null
              }
            ],
            "storageKey": null
          },
          (v8/*:: as any*/),
          (v9/*:: as any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": "ChangeLogEntry",
            "kind": "LinkedField",
            "name": "changeLogs",
            "plural": true,
            "selections": [
              (v10/*:: as any*/),
              (v5/*:: as any*/),
              (v15/*:: as any*/),
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "change",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "changeType",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "timestamp",
                "storageKey": null
              }
            ],
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "TokenBinding",
            "kind": "LinkedField",
            "name": "tokenBindings",
            "plural": true,
            "selections": [
              (v10/*:: as any*/),
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "node",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "consumesSymbol",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "rank",
                "storageKey": null
              }
            ],
            "storageKey": null
          },
          {
            "alias": null,
            "args": (v12/*:: as any*/),
            "concreteType": "ModifierFamilyConnection",
            "kind": "LinkedField",
            "name": "modifierFamilies",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "ModifierFamilyEdge",
                "kind": "LinkedField",
                "name": "edges",
                "plural": true,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "ModifierFamily",
                    "kind": "LinkedField",
                    "name": "node",
                    "plural": false,
                    "selections": [
                      (v4/*:: as any*/),
                      {
                        "alias": null,
                        "args": (v13/*:: as any*/),
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
                              (v10/*:: as any*/),
                              {
                                "alias": null,
                                "args": null,
                                "concreteType": "Modifier",
                                "kind": "LinkedField",
                                "name": "node",
                                "plural": false,
                                "selections": [
                                  (v4/*:: as any*/),
                                  (v3/*:: as any*/)
                                ],
                                "storageKey": null
                              }
                            ],
                            "storageKey": null
                          }
                        ],
                        "storageKey": "modifiers(first:100)"
                      },
                      (v3/*:: as any*/),
                      {
                        "kind": "InlineFragment",
                        "selections": [
                          (v10/*:: as any*/),
                          (v18/*:: as any*/),
                          (v19/*:: as any*/),
                          (v23/*:: as any*/),
                          (v24/*:: as any*/),
                          (v25/*:: as any*/),
                          (v26/*:: as any*/),
                          {
                            "kind": "InlineFragment",
                            "selections": [
                              (v15/*:: as any*/)
                            ],
                            "type": "ModifierFamily",
                            "abstractKey": null
                          },
                          (v27/*:: as any*/)
                        ],
                        "type": "Node",
                        "abstractKey": "__isNode"
                      }
                    ],
                    "storageKey": null
                  }
                ],
                "storageKey": null
              }
            ],
            "storageKey": null
          },
          (v15/*:: as any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": "Tier",
            "kind": "LinkedField",
            "name": "tier",
            "plural": false,
            "selections": [
              (v3/*:: as any*/),
              (v4/*:: as any*/)
            ],
            "storageKey": null
          },
          (v21/*:: as any*/),
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "anatomyDsl",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "Property",
            "kind": "LinkedField",
            "name": "properties",
            "plural": true,
            "selections": [
              (v3/*:: as any*/),
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "propertyType",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "optional",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "defaultValue",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "constraints",
                "storageKey": null
              },
              (v15/*:: as any*/)
            ],
            "storageKey": null
          },
          {
            "alias": null,
            "args": (v12/*:: as any*/),
            "concreteType": "UIBlockConnection",
            "kind": "LinkedField",
            "name": "inheritsFroms",
            "plural": false,
            "selections": (v29/*:: as any*/),
            "storageKey": null
          },
          {
            "alias": null,
            "args": (v12/*:: as any*/),
            "concreteType": "UIBlockConnection",
            "kind": "LinkedField",
            "name": "specializedBies",
            "plural": false,
            "selections": (v29/*:: as any*/),
            "storageKey": null
          },
          {
            "alias": null,
            "args": (v12/*:: as any*/),
            "concreteType": "UIBlockConnection",
            "kind": "LinkedField",
            "name": "variants",
            "plural": false,
            "selections": (v29/*:: as any*/),
            "storageKey": null
          },
          {
            "alias": null,
            "args": (v12/*:: as any*/),
            "concreteType": "UIBlockConnection",
            "kind": "LinkedField",
            "name": "variantOfs",
            "plural": false,
            "selections": (v29/*:: as any*/),
            "storageKey": null
          },
          {
            "alias": null,
            "args": (v12/*:: as any*/),
            "concreteType": "SubcomponentConnection",
            "kind": "LinkedField",
            "name": "subcomponents",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "SubcomponentEdge",
                "kind": "LinkedField",
                "name": "edges",
                "plural": true,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "Subcomponent",
                    "kind": "LinkedField",
                    "name": "node",
                    "plural": false,
                    "selections": [
                      (v4/*:: as any*/),
                      {
                        "kind": "InlineFragment",
                        "selections": [
                          (v10/*:: as any*/),
                          (v18/*:: as any*/),
                          (v19/*:: as any*/),
                          (v23/*:: as any*/),
                          (v24/*:: as any*/),
                          (v25/*:: as any*/),
                          (v26/*:: as any*/),
                          (v28/*:: as any*/),
                          (v27/*:: as any*/)
                        ],
                        "type": "Node",
                        "abstractKey": "__isNode"
                      }
                    ],
                    "storageKey": null
                  }
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
  "params": {
    "cacheID": "1512221a1335d707b98a70f465f7912b",
    "id": null,
    "metadata": {},
    "name": "ComponentEntityQuery",
    "operationKind": "query",
    "text": "query ComponentEntityQuery(\n  $uri: String!\n  $count: Int!\n) {\n  component(uri: $uri) {\n    name\n    uri\n    version\n    _meta {\n      curie\n      fields {\n        name\n        order\n        group {\n          order\n          uri\n        }\n      }\n    }\n    usage\n    guidelines\n    changeLogs {\n      __typename\n    }\n    tokenBindings {\n      __typename\n    }\n    modifierFamilies(first: $count) {\n      edges {\n        node {\n          uri\n          modifiers(first: 100) {\n            edges {\n              __typename\n            }\n          }\n        }\n      }\n    }\n    ...ComponentHeader_node\n    ...ComponentAnatomy_node\n    ...ComponentProperties_node\n    ...ComponentRelations_node_yu5n1\n    ...ComponentChanges_node\n    ...ComponentVariants_node_yu5n1\n    ...ComponentTokens_node\n  }\n}\n\nfragment CodeStandardRow_node on CodeStandard {\n  __typename\n  description\n  _meta {\n    title\n    curie\n  }\n  categories(first: 1) {\n    edges {\n      node {\n        _meta {\n          title\n        }\n        uri\n      }\n    }\n  }\n}\n\nfragment ComponentAnatomy_node on Component {\n  name\n  _meta {\n    curie\n  }\n  anatomyDsl\n}\n\nfragment ComponentChanges_node on Component {\n  changeLogs {\n    version\n    summary\n    change\n    changeType\n    timestamp\n  }\n}\n\nfragment ComponentHeader_node on Component {\n  name\n  summary\n  _meta {\n    curie\n  }\n  tier {\n    name\n    uri\n  }\n  documentationStages(first: 1) {\n    edges {\n      node {\n        _meta {\n          title\n        }\n        uri\n      }\n    }\n  }\n}\n\nfragment ComponentProperties_node on Component {\n  properties {\n    name\n    propertyType\n    optional\n    defaultValue\n    constraints\n    summary\n  }\n}\n\nfragment ComponentRelations_node_yu5n1 on Component {\n  inheritsFroms(first: $count) {\n    edges {\n      node {\n        __typename\n        uri\n        ...DocsRowProjection_node\n      }\n    }\n  }\n  specializedBies(first: $count) {\n    edges {\n      node {\n        __typename\n        uri\n        ...DocsRowProjection_node\n      }\n    }\n  }\n  variants(first: $count) {\n    edges {\n      node {\n        __typename\n        uri\n        ...DocsRowProjection_node\n      }\n    }\n  }\n  variantOfs(first: $count) {\n    edges {\n      node {\n        __typename\n        uri\n        ...DocsRowProjection_node\n      }\n    }\n  }\n  subcomponents(first: $count) {\n    edges {\n      node {\n        uri\n        ...DocsRowProjection_node\n      }\n    }\n  }\n  modifierFamilies(first: $count) {\n    edges {\n      node {\n        uri\n        ...DocsRowProjection_node\n      }\n    }\n  }\n}\n\nfragment ComponentTokens_node on Component {\n  tokenBindings {\n    node\n    consumesSymbol\n    rank\n  }\n}\n\nfragment ComponentVariants_node_yu5n1 on Component {\n  modifierFamilies(first: $count) {\n    edges {\n      node {\n        uri\n        name\n        modifiers(first: 100) {\n          edges {\n            node {\n              uri\n              name\n            }\n          }\n        }\n      }\n    }\n  }\n}\n\nfragment DocsRowProjection_node on Node {\n  __isNode: __typename\n  __typename\n  ...RowProjection_node\n  ... on Component {\n    ...UIBlockRow_node\n  }\n  ... on Pattern {\n    ...UIBlockRow_node\n  }\n  ... on Layout {\n    ...UIBlockRow_node\n  }\n  ...ModifierRow_node\n  ...ModifierFamilyRow_node\n  ...CodeStandardRow_node\n}\n\nfragment ModifierFamilyRow_node on ModifierFamily {\n  __typename\n  summary\n  _meta {\n    title\n    curie\n  }\n  modifiers(first: 100) {\n    edges {\n      node {\n        uri\n      }\n    }\n  }\n}\n\nfragment ModifierRow_node on Modifier {\n  __typename\n  summary\n  _meta {\n    title\n    curie\n  }\n  modifierFamily {\n    _meta {\n      title\n    }\n    uri\n  }\n}\n\nfragment NodeRow_node on Node {\n  __isNode: __typename\n  __typename\n  _meta {\n    title\n    curie\n    type {\n      _meta {\n        title\n      }\n      uri\n    }\n  }\n}\n\nfragment OntologyClassRow_node on OntologyClass {\n  __typename\n  isAbstract\n  definition\n  _meta {\n    title\n    curie\n  }\n}\n\nfragment RowProjection_node on Node {\n  __isNode: __typename\n  __typename\n  ...NodeRow_node\n  ...SiteRowSlot_node\n  ...OntologyClassRow_node\n}\n\nfragment SiteRowSlot_node on Node {\n  __isNode: __typename\n  __typename\n}\n\nfragment UIBlockRow_node on UIBlock {\n  __isUIBlock: __typename\n  __typename\n  summary\n  _meta {\n    title\n    curie\n  }\n  documentationStages(first: 1) {\n    edges {\n      node {\n        _meta {\n          title\n        }\n        uri\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "6801e5af0ab01acf84bcc38f868793a7";

export default node;
