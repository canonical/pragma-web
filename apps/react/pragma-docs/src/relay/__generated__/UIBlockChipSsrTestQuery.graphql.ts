/**
 * @generated SignedSource<<5d6a766b14ed681e6f089ee3bd6fa3bb>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type UIBlockChipSsrTestQuery$variables = Record<PropertyKey, never>;
export type UIBlockChipSsrTestQuery$data = {
  readonly node: {
    readonly UIBlockChip_node: {
      readonly " $fragmentSpreads": FragmentRefs<"UIBlockChip_node">;
    } | null | undefined;
  } | null | undefined;
};
export type UIBlockChipSsrTestQuery = {
  response: UIBlockChipSsrTestQuery$data;
  variables: UIBlockChipSsrTestQuery$variables;
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
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "String"
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "UIBlockChipSsrTestQuery",
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
                  "name": "UIBlockChip_node"
                }
              ],
              "type": "UIBlock",
              "abstractKey": "__isUIBlock"
            },
            "kind": "AliasedInlineFragmentSpread",
            "name": "UIBlockChip_node"
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
    "name": "UIBlockChipSsrTestQuery",
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
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "uri",
            "storageKey": null
          },
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
              }
            ],
            "type": "UIBlock",
            "abstractKey": "__isUIBlock"
          }
        ],
        "storageKey": "node(id:\"ssr\")"
      }
    ]
  },
  "params": {
    "cacheID": "c1c2e1294eeb24eded952b667e084cda",
    "id": null,
    "metadata": {
      "relayTestingSelectionTypeInfo": {
        "node": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "Node"
        },
        "node.__isUIBlock": (v1/*:: as any*/),
        "node.__typename": (v1/*:: as any*/),
        "node._meta": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "EntityMeta"
        },
        "node._meta.curie": (v1/*:: as any*/),
        "node._meta.title": (v1/*:: as any*/),
        "node.uri": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "ID"
        }
      }
    },
    "name": "UIBlockChipSsrTestQuery",
    "operationKind": "query",
    "text": "query UIBlockChipSsrTestQuery {\n  node(id: \"ssr\") {\n    __typename\n    ...UIBlockChip_node\n    uri\n  }\n}\n\nfragment UIBlockChip_node on UIBlock {\n  __isUIBlock: __typename\n  __typename\n  _meta {\n    title\n    curie\n  }\n}\n"
  }
};
})();

(node as any).hash = "4bc4e3d105f50c7cd06751f9ad28f7ae";

export default node;
