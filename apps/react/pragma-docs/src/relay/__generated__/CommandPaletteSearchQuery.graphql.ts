/**
 * @generated SignedSource<<1cacc5b56aaa47db2f2982d9cc02c491>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type CommandPaletteSearchQuery$variables = {
  first: number;
  searching: boolean;
  text: string;
};
export type CommandPaletteSearchQuery$data = {
  readonly search?: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly __typename: string;
        readonly _meta: {
          readonly type: {
            readonly _meta: {
              readonly title: string;
            };
          };
        };
        readonly uri: string;
        readonly " $fragmentSpreads": FragmentRefs<"CardProjection_node" | "CommandPaletteResult_node">;
      };
    }>;
  };
};
export type CommandPaletteSearchQuery = {
  response: CommandPaletteSearchQuery$data;
  variables: CommandPaletteSearchQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "first"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "searching"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "text"
},
v3 = [
  {
    "kind": "Variable",
    "name": "first",
    "variableName": "first"
  },
  {
    "kind": "Variable",
    "name": "text",
    "variableName": "text"
  }
],
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "__typename",
  "storageKey": null
},
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "uri",
  "storageKey": null
},
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "title",
  "storageKey": null
},
v7 = {
  "alias": null,
  "args": null,
  "concreteType": "EntityMeta",
  "kind": "LinkedField",
  "name": "_meta",
  "plural": false,
  "selections": [
    (v6/*:: as any*/)
  ],
  "storageKey": null
},
v8 = [
  (v7/*:: as any*/),
  (v5/*:: as any*/)
],
v9 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "definition",
  "storageKey": null
},
v10 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "version",
  "storageKey": null
},
v11 = [
  {
    "kind": "Literal",
    "name": "first",
    "value": 1
  }
],
v12 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "summary",
  "storageKey": null
},
v13 = [
  {
    "kind": "InlineFragment",
    "selections": [
      (v10/*:: as any*/),
      {
        "alias": null,
        "args": (v11/*:: as any*/),
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
                "selections": (v8/*:: as any*/),
                "storageKey": null
              }
            ],
            "storageKey": null
          }
        ],
        "storageKey": "documentationStages(first:1)"
      },
      (v12/*:: as any*/),
      {
        "alias": null,
        "args": null,
        "concreteType": "Tier",
        "kind": "LinkedField",
        "name": "tier",
        "plural": false,
        "selections": (v8/*:: as any*/),
        "storageKey": null
      },
      {
        "alias": null,
        "args": (v11/*:: as any*/),
        "concreteType": "UIBlockConnection",
        "kind": "LinkedField",
        "name": "inheritsFroms",
        "plural": false,
        "selections": [
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
                  (v4/*:: as any*/),
                  (v7/*:: as any*/),
                  (v5/*:: as any*/)
                ],
                "storageKey": null
              }
            ],
            "storageKey": null
          }
        ],
        "storageKey": "inheritsFroms(first:1)"
      }
    ],
    "type": "UIBlock",
    "abstractKey": "__isUIBlock"
  }
];
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*:: as any*/),
      (v1/*:: as any*/),
      (v2/*:: as any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "CommandPaletteSearchQuery",
    "selections": [
      {
        "condition": "searching",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          {
            "alias": null,
            "args": (v3/*:: as any*/),
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
                          {
                            "alias": null,
                            "args": null,
                            "concreteType": "OntologyClass",
                            "kind": "LinkedField",
                            "name": "type",
                            "plural": false,
                            "selections": [
                              (v7/*:: as any*/)
                            ],
                            "storageKey": null
                          }
                        ],
                        "storageKey": null
                      },
                      {
                        "args": null,
                        "kind": "FragmentSpread",
                        "name": "CommandPaletteResult_node"
                      },
                      {
                        "args": null,
                        "kind": "FragmentSpread",
                        "name": "CardProjection_node"
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
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v2/*:: as any*/),
      (v0/*:: as any*/),
      (v1/*:: as any*/)
    ],
    "kind": "Operation",
    "name": "CommandPaletteSearchQuery",
    "selections": [
      {
        "condition": "searching",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          {
            "alias": null,
            "args": (v3/*:: as any*/),
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
                          {
                            "alias": null,
                            "args": null,
                            "concreteType": "OntologyClass",
                            "kind": "LinkedField",
                            "name": "type",
                            "plural": false,
                            "selections": (v8/*:: as any*/),
                            "storageKey": null
                          },
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "curie",
                            "storageKey": null
                          },
                          (v6/*:: as any*/),
                          (v9/*:: as any*/)
                        ],
                        "storageKey": null
                      },
                      {
                        "kind": "TypeDiscriminator",
                        "abstractKey": "__isNode"
                      },
                      {
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
                            "name": "instanceCount",
                            "storageKey": null
                          },
                          (v9/*:: as any*/),
                          {
                            "alias": null,
                            "args": null,
                            "concreteType": "OntologyClass",
                            "kind": "LinkedField",
                            "name": "superclass",
                            "plural": false,
                            "selections": (v8/*:: as any*/),
                            "storageKey": null
                          }
                        ],
                        "type": "OntologyClass",
                        "abstractKey": null
                      },
                      {
                        "kind": "InlineFragment",
                        "selections": (v13/*:: as any*/),
                        "type": "Component",
                        "abstractKey": null
                      },
                      {
                        "kind": "InlineFragment",
                        "selections": (v13/*:: as any*/),
                        "type": "Pattern",
                        "abstractKey": null
                      },
                      {
                        "kind": "InlineFragment",
                        "selections": (v13/*:: as any*/),
                        "type": "Layout",
                        "abstractKey": null
                      },
                      {
                        "kind": "InlineFragment",
                        "selections": [
                          {
                            "alias": null,
                            "args": null,
                            "concreteType": "ModifierFamily",
                            "kind": "LinkedField",
                            "name": "modifierFamily",
                            "plural": false,
                            "selections": (v8/*:: as any*/),
                            "storageKey": null
                          },
                          (v10/*:: as any*/),
                          (v12/*:: as any*/)
                        ],
                        "type": "Modifier",
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
                                    "selections": [
                                      (v5/*:: as any*/)
                                    ],
                                    "storageKey": null
                                  }
                                ],
                                "storageKey": null
                              }
                            ],
                            "storageKey": "modifiers(first:100)"
                          },
                          (v12/*:: as any*/)
                        ],
                        "type": "ModifierFamily",
                        "abstractKey": null
                      },
                      {
                        "kind": "InlineFragment",
                        "selections": [
                          {
                            "alias": null,
                            "args": (v11/*:: as any*/),
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
                                    "selections": (v8/*:: as any*/),
                                    "storageKey": null
                                  }
                                ],
                                "storageKey": null
                              }
                            ],
                            "storageKey": "categories(first:1)"
                          },
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "description",
                            "storageKey": null
                          }
                        ],
                        "type": "CodeStandard",
                        "abstractKey": null
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
      }
    ]
  },
  "params": {
    "cacheID": "1495b68454a0451ececa4ca543ee2323",
    "id": null,
    "metadata": {},
    "name": "CommandPaletteSearchQuery",
    "operationKind": "query",
    "text": "query CommandPaletteSearchQuery(\n  $text: String!\n  $first: Int!\n  $searching: Boolean!\n) {\n  search(text: $text, first: $first) @include(if: $searching) {\n    edges {\n      node {\n        __typename\n        uri\n        _meta {\n          type {\n            _meta {\n              title\n            }\n            uri\n          }\n        }\n        ...CommandPaletteResult_node\n        ...CardProjection_node\n      }\n    }\n  }\n}\n\nfragment CardProjection_node on Node {\n  __isNode: __typename\n  __typename\n  ...NodeCard_node\n  ...SiteCardSlot_node\n  ...OntologyClassCard_node\n}\n\nfragment CodeStandardCard_node on CodeStandard {\n  __typename\n  description\n  _meta {\n    title\n    curie\n  }\n  categories(first: 1) {\n    edges {\n      node {\n        _meta {\n          title\n        }\n        uri\n      }\n    }\n  }\n}\n\nfragment CodeStandardCommand_node on CodeStandard {\n  __typename\n  _meta {\n    title\n    curie\n    type {\n      _meta {\n        title\n      }\n      uri\n    }\n  }\n  categories(first: 1) {\n    edges {\n      node {\n        _meta {\n          title\n        }\n        uri\n      }\n    }\n  }\n}\n\nfragment CommandPaletteResult_node on Node {\n  __isNode: __typename\n  __typename\n  _meta {\n    curie\n  }\n  ...CommandProjection_node\n}\n\nfragment CommandProjection_node on Node {\n  __isNode: __typename\n  __typename\n  ...NodeCommand_node\n  ...SiteCommandSlot_node\n  ...OntologyClassCommand_node\n}\n\nfragment DocsCardProjection_node on Node {\n  __isNode: __typename\n  __typename\n  ...NodeCard_node\n  ...OntologyClassCard_node\n  ... on Component {\n    ...UIBlockCard_node\n  }\n  ... on Pattern {\n    ...UIBlockCard_node\n  }\n  ... on Layout {\n    ...UIBlockCard_node\n  }\n  ...ModifierCard_node\n  ...ModifierFamilyCard_node\n  ...CodeStandardCard_node\n}\n\nfragment DocsCommandProjection_node on Node {\n  __isNode: __typename\n  __typename\n  ...NodeCommand_node\n  ...OntologyClassCommand_node\n  ... on Component {\n    ...UIBlockCommand_node\n  }\n  ... on Pattern {\n    ...UIBlockCommand_node\n  }\n  ... on Layout {\n    ...UIBlockCommand_node\n  }\n  ...ModifierCommand_node\n  ...ModifierFamilyCommand_node\n  ...CodeStandardCommand_node\n}\n\nfragment ModifierCard_node on Modifier {\n  __typename\n  version\n  summary\n  _meta {\n    title\n    curie\n  }\n  modifierFamily {\n    _meta {\n      title\n    }\n    uri\n  }\n}\n\nfragment ModifierCommand_node on Modifier {\n  __typename\n  _meta {\n    title\n    curie\n    type {\n      _meta {\n        title\n      }\n      uri\n    }\n  }\n  modifierFamily {\n    _meta {\n      title\n    }\n    uri\n  }\n}\n\nfragment ModifierFamilyCard_node on ModifierFamily {\n  __typename\n  summary\n  _meta {\n    title\n    curie\n  }\n  modifiers(first: 100) {\n    edges {\n      node {\n        uri\n      }\n    }\n  }\n}\n\nfragment ModifierFamilyCommand_node on ModifierFamily {\n  __typename\n  _meta {\n    title\n    curie\n    type {\n      _meta {\n        title\n      }\n      uri\n    }\n  }\n  modifiers(first: 100) {\n    edges {\n      node {\n        uri\n      }\n    }\n  }\n}\n\nfragment NodeCard_node on Node {\n  __isNode: __typename\n  __typename\n  _meta {\n    title\n    curie\n    definition\n    type {\n      _meta {\n        title\n      }\n      uri\n    }\n  }\n}\n\nfragment NodeCommand_node on Node {\n  __isNode: __typename\n  __typename\n  _meta {\n    title\n    curie\n    type {\n      _meta {\n        title\n      }\n      uri\n    }\n  }\n}\n\nfragment OntologyClassCard_node on OntologyClass {\n  __typename\n  isAbstract\n  definition\n  _meta {\n    title\n    curie\n  }\n  superclass {\n    _meta {\n      title\n    }\n    uri\n  }\n}\n\nfragment OntologyClassCommand_node on OntologyClass {\n  __typename\n  isAbstract\n  instanceCount\n  _meta {\n    title\n    curie\n  }\n}\n\nfragment SiteCardSlot_node on Node {\n  __isNode: __typename\n  ...DocsCardProjection_node\n}\n\nfragment SiteCommandSlot_node on Node {\n  __isNode: __typename\n  ...DocsCommandProjection_node\n}\n\nfragment UIBlockCard_node on UIBlock {\n  __isUIBlock: __typename\n  __typename\n  version\n  summary\n  _meta {\n    title\n    curie\n  }\n  tier {\n    _meta {\n      title\n    }\n    uri\n  }\n  inheritsFroms(first: 1) {\n    edges {\n      node {\n        __typename\n        _meta {\n          title\n        }\n        uri\n      }\n    }\n  }\n  documentationStages(first: 1) {\n    edges {\n      node {\n        _meta {\n          title\n        }\n        uri\n      }\n    }\n  }\n}\n\nfragment UIBlockCommand_node on UIBlock {\n  __isUIBlock: __typename\n  __typename\n  version\n  _meta {\n    title\n    curie\n    type {\n      _meta {\n        title\n      }\n      uri\n    }\n  }\n  documentationStages(first: 1) {\n    edges {\n      node {\n        _meta {\n          title\n        }\n        uri\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "e6cb3c6c744d41a220cb4e3d808a5389";

export default node;
