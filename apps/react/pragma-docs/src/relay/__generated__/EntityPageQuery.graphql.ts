/**
 * @generated SignedSource<<f7394241f85ae855553dd47f6185bccc>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type TermVisibility = "HIDDEN" | "NORMAL" | "PROMINENT" | "%future added value";
export type EntityPageQuery$variables = {
  classUri: string;
  id: string;
};
export type EntityPageQuery$data = {
  readonly node: {
    readonly _meta: {
      readonly comment: string | null | undefined;
      readonly curie: string;
      readonly definition: string | null | undefined;
      readonly fields: ReadonlyArray<{
        readonly group: {
          readonly label: string | null | undefined;
          readonly order: number | null | undefined;
          readonly uri: string;
        } | null | undefined;
        readonly name: string;
        readonly order: number | null | undefined;
        readonly property: {
          readonly uri: string;
        };
        readonly visibility: TermVisibility | null | undefined;
      }>;
      readonly label: string | null | undefined;
      readonly title: string;
      readonly type: {
        readonly label: string | null | undefined;
        readonly superclasses: ReadonlyArray<{
          readonly uri: string;
        }>;
        readonly uri: string;
        readonly " $fragmentSpreads": FragmentRefs<"ChipProjection_node">;
      };
    };
    readonly uri: string;
    readonly " $fragmentSpreads": FragmentRefs<"EntitySummary_node">;
  } | null | undefined;
  readonly ontologyClass: {
    readonly uri: string;
  } | null | undefined;
};
export type EntityPageQuery = {
  response: EntityPageQuery$data;
  variables: EntityPageQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "classUri"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "id"
},
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "uri",
  "storageKey": null
},
v3 = [
  (v2/*:: as any*/)
],
v4 = {
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
  "selections": (v3/*:: as any*/),
  "storageKey": null
},
v5 = [
  {
    "kind": "Variable",
    "name": "id",
    "variableName": "id"
  }
],
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
  "kind": "ScalarField",
  "name": "curie",
  "storageKey": null
},
v8 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "label",
  "storageKey": null
},
v9 = {
  "alias": null,
  "args": null,
  "concreteType": "OntologyClass",
  "kind": "LinkedField",
  "name": "superclasses",
  "plural": true,
  "selections": (v3/*:: as any*/),
  "storageKey": null
},
v10 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "comment",
  "storageKey": null
},
v11 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "definition",
  "storageKey": null
},
v12 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "order",
  "storageKey": null
},
v13 = {
  "alias": null,
  "args": null,
  "concreteType": "ClassProperty",
  "kind": "LinkedField",
  "name": "fields",
  "plural": true,
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "name",
      "storageKey": null
    },
    (v12/*:: as any*/),
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "visibility",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "PropertyGroup",
      "kind": "LinkedField",
      "name": "group",
      "plural": false,
      "selections": [
        (v2/*:: as any*/),
        (v8/*:: as any*/),
        (v12/*:: as any*/)
      ],
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "OntologyProperty",
      "kind": "LinkedField",
      "name": "property",
      "plural": false,
      "selections": (v3/*:: as any*/),
      "storageKey": null
    }
  ],
  "storageKey": null
},
v14 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "__typename",
  "storageKey": null
},
v15 = [
  {
    "kind": "TypeDiscriminator",
    "abstractKey": "__isUIBlock"
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
    "name": "EntityPageQuery",
    "selections": [
      (v4/*:: as any*/),
      {
        "alias": null,
        "args": (v5/*:: as any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          (v2/*:: as any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": "EntityMeta",
            "kind": "LinkedField",
            "name": "_meta",
            "plural": false,
            "selections": [
              (v6/*:: as any*/),
              (v7/*:: as any*/),
              {
                "alias": null,
                "args": null,
                "concreteType": "OntologyClass",
                "kind": "LinkedField",
                "name": "type",
                "plural": false,
                "selections": [
                  (v2/*:: as any*/),
                  (v8/*:: as any*/),
                  {
                    "args": null,
                    "kind": "FragmentSpread",
                    "name": "ChipProjection_node"
                  },
                  (v9/*:: as any*/)
                ],
                "storageKey": null
              },
              (v8/*:: as any*/),
              (v10/*:: as any*/),
              (v11/*:: as any*/),
              (v13/*:: as any*/)
            ],
            "storageKey": null
          },
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "EntitySummary_node"
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
    "name": "EntityPageQuery",
    "selections": [
      (v4/*:: as any*/),
      {
        "alias": null,
        "args": (v5/*:: as any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          (v14/*:: as any*/),
          (v2/*:: as any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": "EntityMeta",
            "kind": "LinkedField",
            "name": "_meta",
            "plural": false,
            "selections": [
              (v6/*:: as any*/),
              (v7/*:: as any*/),
              {
                "alias": null,
                "args": null,
                "concreteType": "OntologyClass",
                "kind": "LinkedField",
                "name": "type",
                "plural": false,
                "selections": [
                  (v2/*:: as any*/),
                  (v8/*:: as any*/),
                  (v9/*:: as any*/),
                  {
                    "kind": "InlineFragment",
                    "selections": [
                      (v14/*:: as any*/),
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "EntityMeta",
                        "kind": "LinkedField",
                        "name": "_meta",
                        "plural": false,
                        "selections": [
                          (v6/*:: as any*/),
                          (v7/*:: as any*/)
                        ],
                        "storageKey": null
                      },
                      {
                        "kind": "InlineFragment",
                        "selections": (v15/*:: as any*/),
                        "type": "Component",
                        "abstractKey": null
                      },
                      {
                        "kind": "InlineFragment",
                        "selections": (v15/*:: as any*/),
                        "type": "Pattern",
                        "abstractKey": null
                      },
                      {
                        "kind": "InlineFragment",
                        "selections": (v15/*:: as any*/),
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
                                    "selections": (v3/*:: as any*/),
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
                    "type": "Node",
                    "abstractKey": "__isNode"
                  }
                ],
                "storageKey": null
              },
              (v8/*:: as any*/),
              (v10/*:: as any*/),
              (v11/*:: as any*/),
              (v13/*:: as any*/)
            ],
            "storageKey": null
          },
          {
            "kind": "TypeDiscriminator",
            "abstractKey": "__isNode"
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "3c6c94e4fb27111687992964ef40b622",
    "id": null,
    "metadata": {},
    "name": "EntityPageQuery",
    "operationKind": "query",
    "text": "query EntityPageQuery(\n  $id: ID!\n  $classUri: String!\n) {\n  ontologyClass(uri: $classUri) {\n    uri\n  }\n  node(id: $id) {\n    __typename\n    uri\n    _meta {\n      title\n      curie\n      type {\n        uri\n        label\n        ...ChipProjection_node\n        superclasses {\n          uri\n        }\n      }\n      label\n      comment\n      definition\n      fields {\n        name\n        order\n        visibility\n        group {\n          uri\n          label\n          order\n        }\n        property {\n          uri\n        }\n      }\n    }\n    ...EntitySummary_node\n  }\n}\n\nfragment ChipProjection_node on Node {\n  __isNode: __typename\n  __typename\n  ...NodeChip_node\n  ...SiteChipSlot_node\n  ...OntologyClassChip_node\n}\n\nfragment CodeStandardChip_node on CodeStandard {\n  __typename\n  uri\n  _meta {\n    title\n    curie\n  }\n}\n\nfragment DocsChipProjection_node on Node {\n  __isNode: __typename\n  __typename\n  ...NodeChip_node\n  ...OntologyClassChip_node\n  ... on Component {\n    ...UIBlockChip_node\n  }\n  ... on Pattern {\n    ...UIBlockChip_node\n  }\n  ... on Layout {\n    ...UIBlockChip_node\n  }\n  ...ModifierChip_node\n  ...ModifierFamilyChip_node\n  ...CodeStandardChip_node\n}\n\nfragment EntitySummary_node on Node {\n  __isNode: __typename\n  _meta {\n    definition\n    comment\n    type {\n      ...ChipProjection_node\n      uri\n    }\n  }\n}\n\nfragment ModifierChip_node on Modifier {\n  __typename\n  uri\n  _meta {\n    title\n    curie\n  }\n}\n\nfragment ModifierFamilyChip_node on ModifierFamily {\n  __typename\n  uri\n  _meta {\n    title\n    curie\n  }\n  modifiers(first: 100) {\n    edges {\n      node {\n        uri\n      }\n    }\n  }\n}\n\nfragment NodeChip_node on Node {\n  __isNode: __typename\n  __typename\n  uri\n  _meta {\n    title\n    curie\n  }\n}\n\nfragment OntologyClassChip_node on OntologyClass {\n  __typename\n  uri\n  _meta {\n    title\n    curie\n  }\n}\n\nfragment SiteChipSlot_node on Node {\n  __isNode: __typename\n  ...DocsChipProjection_node\n}\n\nfragment UIBlockChip_node on UIBlock {\n  __isUIBlock: __typename\n  __typename\n  uri\n  _meta {\n    title\n    curie\n  }\n}\n"
  }
};
})();

(node as any).hash = "a5dba8a626db8d89ecafb5c76f34c0fc";

export default node;
