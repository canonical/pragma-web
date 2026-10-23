/**
 * @generated SignedSource<<615b0916b7aef3a100c936106fe0288d>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ModifierFamilyChipTestQuery$variables = Record<PropertyKey, never>;
export type ModifierFamilyChipTestQuery$data = {
  readonly node: {
    readonly ModifierFamilyChip_node: {
      readonly " $fragmentSpreads": FragmentRefs<"ModifierFamilyChip_node">;
    } | null | undefined;
  } | null | undefined;
};
export type ModifierFamilyChipTestQuery = {
  response: ModifierFamilyChipTestQuery$data;
  variables: ModifierFamilyChipTestQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "kind": "Literal",
    "name": "id",
    "value": "test"
  }
],
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "uri",
  "storageKey": null
},
v2 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "String"
},
v3 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "ID"
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "ModifierFamilyChipTestQuery",
    "selections": [
      {
        "alias": null,
        "args": (v0/*:: as any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          {
            "fragment": {
              "kind": "InlineFragment",
              "selections": [
                {
                  "args": null,
                  "kind": "FragmentSpread",
                  "name": "ModifierFamilyChip_node"
                }
              ],
              "type": "ModifierFamily",
              "abstractKey": null
            },
            "kind": "AliasedInlineFragmentSpread",
            "name": "ModifierFamilyChip_node"
          }
        ],
        "storageKey": "node(id:\"test\")"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "ModifierFamilyChipTestQuery",
    "selections": [
      {
        "alias": null,
        "args": (v0/*:: as any*/),
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
          (v1/*:: as any*/),
          {
            "kind": "InlineFragment",
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
                          (v1/*:: as any*/)
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
          }
        ],
        "storageKey": "node(id:\"test\")"
      }
    ]
  },
  "params": {
    "cacheID": "e9406ba83d8d84dabc23bb9e10562295",
    "id": null,
    "metadata": {
      "relayTestingSelectionTypeInfo": {
        "node": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "Node"
        },
        "node.__typename": (v2/*:: as any*/),
        "node._meta": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "EntityMeta"
        },
        "node._meta.curie": (v2/*:: as any*/),
        "node._meta.title": (v2/*:: as any*/),
        "node.modifiers": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "ModifierConnection"
        },
        "node.modifiers.edges": {
          "enumValues": null,
          "nullable": false,
          "plural": true,
          "type": "ModifierEdge"
        },
        "node.modifiers.edges.node": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "Modifier"
        },
        "node.modifiers.edges.node.uri": (v3/*:: as any*/),
        "node.uri": (v3/*:: as any*/)
      }
    },
    "name": "ModifierFamilyChipTestQuery",
    "operationKind": "query",
    "text": "query ModifierFamilyChipTestQuery {\n  node(id: \"test\") {\n    __typename\n    ...ModifierFamilyChip_node\n    uri\n  }\n}\n\nfragment ModifierFamilyChip_node on ModifierFamily {\n  __typename\n  _meta {\n    title\n    curie\n  }\n  modifiers(first: 100) {\n    edges {\n      node {\n        uri\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "7f4baeedbd1f6e7e168697e83d0386e2";

export default node;
