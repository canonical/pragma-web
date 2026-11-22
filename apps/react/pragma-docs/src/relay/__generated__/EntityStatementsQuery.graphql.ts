/**
 * @generated SignedSource<<8039c7dee9fecd76a3257e33a8e82e58>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type TermVisibility = "HIDDEN" | "NORMAL" | "PROMINENT" | "%future added value";
export type EntityStatementsQuery$variables = {
  uri: string;
};
export type EntityStatementsQuery$data = {
  readonly incoming: {
    readonly groups: ReadonlyArray<{
      readonly predicate: {
        readonly inverseLabel: string | null | undefined;
        readonly inversePluralLabel: string | null | undefined;
        readonly label: string | null | undefined;
        readonly pluralLabel: string | null | undefined;
      } | null | undefined;
      readonly predicateUri: string;
      readonly total: number;
      readonly values: ReadonlyArray<{
        readonly __typename: "StatementLiteral";
        readonly lexical: string;
      } | {
        readonly __typename: "StatementNode";
        readonly node: {
          readonly _meta: {
            readonly type: {
              readonly visibility: TermVisibility | null | undefined;
            };
          };
        };
      } | {
        // This will never be '%other', but we need some
        // value in case none of the concrete values match.
        readonly __typename: "%other";
      }>;
      readonly " $fragmentSpreads": FragmentRefs<"StatementGroup_group">;
    }>;
    readonly total: number;
  } | null | undefined;
  readonly outgoing: {
    readonly groups: ReadonlyArray<{
      readonly predicate: {
        readonly inverseLabel: string | null | undefined;
        readonly inversePluralLabel: string | null | undefined;
        readonly label: string | null | undefined;
        readonly pluralLabel: string | null | undefined;
      } | null | undefined;
      readonly predicateUri: string;
      readonly total: number;
      readonly values: ReadonlyArray<{
        readonly __typename: "StatementLiteral";
        readonly lexical: string;
      } | {
        readonly __typename: "StatementNode";
        readonly node: {
          readonly _meta: {
            readonly type: {
              readonly visibility: TermVisibility | null | undefined;
            };
          };
        };
      } | {
        // This will never be '%other', but we need some
        // value in case none of the concrete values match.
        readonly __typename: "%other";
      }>;
      readonly " $fragmentSpreads": FragmentRefs<"StatementGroup_group">;
    }>;
    readonly total: number;
  } | null | undefined;
};
export type EntityStatementsQuery = {
  response: EntityStatementsQuery$data;
  variables: EntityStatementsQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "uri"
  }
],
v1 = {
  "kind": "Variable",
  "name": "uri",
  "variableName": "uri"
},
v2 = [
  {
    "kind": "Literal",
    "name": "direction",
    "value": "OUT"
  },
  (v1/*:: as any*/)
],
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "total",
  "storageKey": null
},
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "predicateUri",
  "storageKey": null
},
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "label",
  "storageKey": null
},
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "pluralLabel",
  "storageKey": null
},
v7 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "inverseLabel",
  "storageKey": null
},
v8 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "inversePluralLabel",
  "storageKey": null
},
v9 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "__typename",
  "storageKey": null
},
v10 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "visibility",
  "storageKey": null
},
v11 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "lexical",
  "storageKey": null
},
v12 = [
  (v3/*:: as any*/),
  {
    "alias": null,
    "args": null,
    "concreteType": "StatementGroup",
    "kind": "LinkedField",
    "name": "groups",
    "plural": true,
    "selections": [
      (v4/*:: as any*/),
      (v3/*:: as any*/),
      {
        "alias": null,
        "args": null,
        "concreteType": "OntologyProperty",
        "kind": "LinkedField",
        "name": "predicate",
        "plural": false,
        "selections": [
          (v5/*:: as any*/),
          (v6/*:: as any*/),
          (v7/*:: as any*/),
          (v8/*:: as any*/)
        ],
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "concreteType": null,
        "kind": "LinkedField",
        "name": "values",
        "plural": true,
        "selections": [
          (v9/*:: as any*/),
          {
            "kind": "InlineFragment",
            "selections": [
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
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "OntologyClass",
                        "kind": "LinkedField",
                        "name": "type",
                        "plural": false,
                        "selections": [
                          (v10/*:: as any*/)
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
            "type": "StatementNode",
            "abstractKey": null
          },
          {
            "kind": "InlineFragment",
            "selections": [
              (v11/*:: as any*/)
            ],
            "type": "StatementLiteral",
            "abstractKey": null
          }
        ],
        "storageKey": null
      },
      {
        "args": null,
        "kind": "FragmentSpread",
        "name": "StatementGroup_group"
      }
    ],
    "storageKey": null
  }
],
v13 = [
  {
    "kind": "Literal",
    "name": "direction",
    "value": "IN"
  },
  (v1/*:: as any*/)
],
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
  "kind": "ScalarField",
  "name": "curie",
  "storageKey": null
},
v17 = {
  "kind": "TypeDiscriminator",
  "abstractKey": "__isNode"
},
v18 = [
  {
    "kind": "TypeDiscriminator",
    "abstractKey": "__isUIBlock"
  }
],
v19 = {
  "kind": "InlineFragment",
  "selections": (v18/*:: as any*/),
  "type": "Component",
  "abstractKey": null
},
v20 = {
  "kind": "InlineFragment",
  "selections": (v18/*:: as any*/),
  "type": "Pattern",
  "abstractKey": null
},
v21 = {
  "kind": "InlineFragment",
  "selections": (v18/*:: as any*/),
  "type": "Layout",
  "abstractKey": null
},
v22 = {
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
                (v14/*:: as any*/)
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
v23 = {
  "kind": "InlineFragment",
  "selections": [
    (v11/*:: as any*/),
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "lang",
      "storageKey": null
    }
  ],
  "type": "StatementLiteral",
  "abstractKey": null
},
v24 = {
  "alias": null,
  "args": null,
  "concreteType": "EntityMeta",
  "kind": "LinkedField",
  "name": "_meta",
  "plural": false,
  "selections": [
    (v15/*:: as any*/),
    (v16/*:: as any*/)
  ],
  "storageKey": null
},
v25 = {
  "alias": null,
  "args": null,
  "concreteType": "OntologyClass",
  "kind": "LinkedField",
  "name": "type",
  "plural": false,
  "selections": [
    (v14/*:: as any*/),
    {
      "kind": "InlineFragment",
      "selections": [
        (v9/*:: as any*/),
        (v24/*:: as any*/),
        (v19/*:: as any*/),
        (v20/*:: as any*/),
        (v21/*:: as any*/),
        (v22/*:: as any*/)
      ],
      "type": "Node",
      "abstractKey": "__isNode"
    }
  ],
  "storageKey": null
},
v26 = [
  (v3/*:: as any*/),
  {
    "alias": null,
    "args": null,
    "concreteType": "StatementGroup",
    "kind": "LinkedField",
    "name": "groups",
    "plural": true,
    "selections": [
      (v4/*:: as any*/),
      (v3/*:: as any*/),
      {
        "alias": null,
        "args": null,
        "concreteType": "OntologyProperty",
        "kind": "LinkedField",
        "name": "predicate",
        "plural": false,
        "selections": [
          (v5/*:: as any*/),
          (v6/*:: as any*/),
          (v7/*:: as any*/),
          (v8/*:: as any*/),
          (v14/*:: as any*/)
        ],
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "concreteType": null,
        "kind": "LinkedField",
        "name": "values",
        "plural": true,
        "selections": [
          (v9/*:: as any*/),
          {
            "kind": "InlineFragment",
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": null,
                "kind": "LinkedField",
                "name": "node",
                "plural": false,
                "selections": [
                  (v9/*:: as any*/),
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
                          (v10/*:: as any*/),
                          (v14/*:: as any*/)
                        ],
                        "storageKey": null
                      },
                      (v15/*:: as any*/),
                      (v16/*:: as any*/)
                    ],
                    "storageKey": null
                  },
                  (v14/*:: as any*/),
                  (v17/*:: as any*/),
                  (v19/*:: as any*/),
                  (v20/*:: as any*/),
                  (v21/*:: as any*/),
                  (v22/*:: as any*/)
                ],
                "storageKey": null
              }
            ],
            "type": "StatementNode",
            "abstractKey": null
          },
          (v23/*:: as any*/),
          {
            "kind": "InlineFragment",
            "selections": [
              (v14/*:: as any*/),
              (v16/*:: as any*/)
            ],
            "type": "StatementForeign",
            "abstractKey": null
          },
          {
            "kind": "InlineFragment",
            "selections": [
              (v25/*:: as any*/),
              {
                "alias": null,
                "args": null,
                "concreteType": "StatementGroup",
                "kind": "LinkedField",
                "name": "groups",
                "plural": true,
                "selections": [
                  (v4/*:: as any*/),
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "OntologyProperty",
                    "kind": "LinkedField",
                    "name": "predicate",
                    "plural": false,
                    "selections": [
                      (v5/*:: as any*/),
                      (v14/*:: as any*/)
                    ],
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": null,
                    "kind": "LinkedField",
                    "name": "values",
                    "plural": true,
                    "selections": [
                      (v9/*:: as any*/),
                      {
                        "kind": "InlineFragment",
                        "selections": [
                          {
                            "alias": null,
                            "args": null,
                            "concreteType": null,
                            "kind": "LinkedField",
                            "name": "node",
                            "plural": false,
                            "selections": [
                              (v9/*:: as any*/),
                              (v14/*:: as any*/),
                              (v17/*:: as any*/),
                              (v24/*:: as any*/),
                              (v19/*:: as any*/),
                              (v20/*:: as any*/),
                              (v21/*:: as any*/),
                              (v22/*:: as any*/)
                            ],
                            "storageKey": null
                          }
                        ],
                        "type": "StatementNode",
                        "abstractKey": null
                      },
                      (v23/*:: as any*/),
                      {
                        "kind": "InlineFragment",
                        "selections": [
                          (v16/*:: as any*/),
                          (v14/*:: as any*/)
                        ],
                        "type": "StatementForeign",
                        "abstractKey": null
                      },
                      {
                        "kind": "InlineFragment",
                        "selections": [
                          (v25/*:: as any*/)
                        ],
                        "type": "StatementNested",
                        "abstractKey": null
                      }
                    ],
                    "storageKey": null
                  }
                ],
                "storageKey": null
              }
            ],
            "type": "StatementNested",
            "abstractKey": null
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
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "EntityStatementsQuery",
    "selections": [
      {
        "alias": "outgoing",
        "args": (v2/*:: as any*/),
        "concreteType": "StatementGroups",
        "kind": "LinkedField",
        "name": "statements",
        "plural": false,
        "selections": (v12/*:: as any*/),
        "storageKey": null
      },
      {
        "alias": "incoming",
        "args": (v13/*:: as any*/),
        "concreteType": "StatementGroups",
        "kind": "LinkedField",
        "name": "statements",
        "plural": false,
        "selections": (v12/*:: as any*/),
        "storageKey": null
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Operation",
    "name": "EntityStatementsQuery",
    "selections": [
      {
        "alias": "outgoing",
        "args": (v2/*:: as any*/),
        "concreteType": "StatementGroups",
        "kind": "LinkedField",
        "name": "statements",
        "plural": false,
        "selections": (v26/*:: as any*/),
        "storageKey": null
      },
      {
        "alias": "incoming",
        "args": (v13/*:: as any*/),
        "concreteType": "StatementGroups",
        "kind": "LinkedField",
        "name": "statements",
        "plural": false,
        "selections": (v26/*:: as any*/),
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "b022a7ee424feef6ac0d3c5791b8ae28",
    "id": null,
    "metadata": {},
    "name": "EntityStatementsQuery",
    "operationKind": "query",
    "text": "query EntityStatementsQuery(\n  $uri: ID!\n) {\n  outgoing: statements(uri: $uri, direction: OUT) {\n    total\n    groups {\n      predicateUri\n      total\n      predicate {\n        label\n        pluralLabel\n        inverseLabel\n        inversePluralLabel\n        uri\n      }\n      values {\n        __typename\n        ... on StatementNode {\n          node {\n            __typename\n            _meta {\n              type {\n                visibility\n                uri\n              }\n            }\n            uri\n          }\n        }\n        ... on StatementLiteral {\n          lexical\n        }\n        ... on StatementForeign {\n          uri\n        }\n      }\n      ...StatementGroup_group\n    }\n  }\n  incoming: statements(uri: $uri, direction: IN) {\n    total\n    groups {\n      predicateUri\n      total\n      predicate {\n        label\n        pluralLabel\n        inverseLabel\n        inversePluralLabel\n        uri\n      }\n      values {\n        __typename\n        ... on StatementNode {\n          node {\n            __typename\n            _meta {\n              type {\n                visibility\n                uri\n              }\n            }\n            uri\n          }\n        }\n        ... on StatementLiteral {\n          lexical\n        }\n        ... on StatementForeign {\n          uri\n        }\n      }\n      ...StatementGroup_group\n    }\n  }\n}\n\nfragment ChipProjection_node on Node {\n  __isNode: __typename\n  __typename\n  ...NodeChip_node\n  ...SiteChipSlot_node\n  ...OntologyClassChip_node\n}\n\nfragment CodeStandardChip_node on CodeStandard {\n  __typename\n  uri\n  _meta {\n    title\n    curie\n  }\n}\n\nfragment DocsChipProjection_node on Node {\n  __isNode: __typename\n  __typename\n  ...NodeChip_node\n  ...OntologyClassChip_node\n  ... on Component {\n    ...UIBlockChip_node\n  }\n  ... on Pattern {\n    ...UIBlockChip_node\n  }\n  ... on Layout {\n    ...UIBlockChip_node\n  }\n  ...ModifierChip_node\n  ...ModifierFamilyChip_node\n  ...CodeStandardChip_node\n}\n\nfragment ModifierChip_node on Modifier {\n  __typename\n  uri\n  _meta {\n    title\n    curie\n  }\n}\n\nfragment ModifierFamilyChip_node on ModifierFamily {\n  __typename\n  uri\n  _meta {\n    title\n    curie\n  }\n  modifiers(first: 100) {\n    edges {\n      node {\n        uri\n      }\n    }\n  }\n}\n\nfragment NodeChip_node on Node {\n  __isNode: __typename\n  __typename\n  uri\n  _meta {\n    title\n    curie\n  }\n}\n\nfragment OntologyClassChip_node on OntologyClass {\n  __typename\n  uri\n  _meta {\n    title\n    curie\n  }\n}\n\nfragment SiteChipSlot_node on Node {\n  __isNode: __typename\n  ...DocsChipProjection_node\n}\n\nfragment StatementGroup_group on StatementGroup {\n  total\n  values {\n    __typename\n    ... on StatementNode {\n      node {\n        __typename\n        uri\n        ...ChipProjection_node\n      }\n    }\n    ... on StatementLiteral {\n      lexical\n      lang\n    }\n    ... on StatementForeign {\n      curie\n      uri\n    }\n    ... on StatementNested {\n      type {\n        ...ChipProjection_node\n        uri\n      }\n      groups {\n        predicateUri\n        predicate {\n          label\n          uri\n        }\n        values {\n          __typename\n          ... on StatementNode {\n            node {\n              __typename\n              uri\n              ...ChipProjection_node\n            }\n          }\n          ... on StatementLiteral {\n            lexical\n            lang\n          }\n          ... on StatementForeign {\n            curie\n            uri\n          }\n          ... on StatementNested {\n            type {\n              ...ChipProjection_node\n              uri\n            }\n          }\n        }\n      }\n    }\n  }\n}\n\nfragment UIBlockChip_node on UIBlock {\n  __isUIBlock: __typename\n  __typename\n  uri\n  _meta {\n    title\n    curie\n  }\n}\n"
  }
};
})();

(node as any).hash = "167d83a57206177628f29ffbff35864e";

export default node;
