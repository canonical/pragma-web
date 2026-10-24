/**
 * @generated SignedSource<<5fad8a012b899a4f9f97a6620ac6a201>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ModifierRowSsrTestQuery$variables = Record<PropertyKey, never>;
export type ModifierRowSsrTestQuery$data = {
  readonly node: {
    readonly ModifierRow_node: {
      readonly " $fragmentSpreads": FragmentRefs<"ModifierRow_node">;
    } | null | undefined;
  } | null | undefined;
};
export type ModifierRowSsrTestQuery = {
  response: ModifierRowSsrTestQuery$data;
  variables: ModifierRowSsrTestQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "kind": "Literal",
    "name": "id",
    "value": "ssr"
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
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "title",
  "storageKey": null
},
v3 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "String"
},
v4 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "EntityMeta"
},
v5 = {
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
    "name": "ModifierRowSsrTestQuery",
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
                  "name": "ModifierRow_node"
                }
              ],
              "type": "Modifier",
              "abstractKey": null
            },
            "kind": "AliasedInlineFragmentSpread",
            "name": "ModifierRow_node"
          }
        ],
        "storageKey": "node(id:\"ssr\")"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "ModifierRowSsrTestQuery",
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
                  (v2/*:: as any*/),
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
                "args": null,
                "concreteType": "ModifierFamily",
                "kind": "LinkedField",
                "name": "modifierFamily",
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
                      (v2/*:: as any*/)
                    ],
                    "storageKey": null
                  },
                  (v1/*:: as any*/)
                ],
                "storageKey": null
              }
            ],
            "type": "Modifier",
            "abstractKey": null
          }
        ],
        "storageKey": "node(id:\"ssr\")"
      }
    ]
  },
  "params": {
    "cacheID": "cbe5f4cc92a9bbbdbf8c6922dace58e9",
    "id": null,
    "metadata": {
      "relayTestingSelectionTypeInfo": {
        "node": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "Node"
        },
        "node.__typename": (v3/*:: as any*/),
        "node._meta": (v4/*:: as any*/),
        "node._meta.curie": (v3/*:: as any*/),
        "node._meta.title": (v3/*:: as any*/),
        "node.modifierFamily": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "ModifierFamily"
        },
        "node.modifierFamily._meta": (v4/*:: as any*/),
        "node.modifierFamily._meta.title": (v3/*:: as any*/),
        "node.modifierFamily.uri": (v5/*:: as any*/),
        "node.uri": (v5/*:: as any*/)
      }
    },
    "name": "ModifierRowSsrTestQuery",
    "operationKind": "query",
    "text": "query ModifierRowSsrTestQuery {\n  node(id: \"ssr\") {\n    __typename\n    ...ModifierRow_node\n    uri\n  }\n}\n\nfragment ModifierRow_node on Modifier {\n  __typename\n  _meta {\n    title\n    curie\n  }\n  modifierFamily {\n    _meta {\n      title\n    }\n    uri\n  }\n}\n"
  }
};
})();

(node as any).hash = "624428e347f304a0184bc7dd3eb682ce";

export default node;
