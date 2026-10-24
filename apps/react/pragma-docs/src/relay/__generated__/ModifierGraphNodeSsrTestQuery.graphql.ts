/**
 * @generated SignedSource<<d85d4d9f3837a53c4a2096fa8d19d78b>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ModifierGraphNodeSsrTestQuery$variables = Record<PropertyKey, never>;
export type ModifierGraphNodeSsrTestQuery$data = {
  readonly node: {
    readonly ModifierGraphNode_node: {
      readonly " $fragmentSpreads": FragmentRefs<"ModifierGraphNode_node">;
    } | null | undefined;
  } | null | undefined;
};
export type ModifierGraphNodeSsrTestQuery = {
  response: ModifierGraphNodeSsrTestQuery$data;
  variables: ModifierGraphNodeSsrTestQuery$variables;
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
    "name": "ModifierGraphNodeSsrTestQuery",
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
                  "name": "ModifierGraphNode_node"
                }
              ],
              "type": "Modifier",
              "abstractKey": null
            },
            "kind": "AliasedInlineFragmentSpread",
            "name": "ModifierGraphNode_node"
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
    "name": "ModifierGraphNodeSsrTestQuery",
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
                  },
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "OntologyClass",
                    "kind": "LinkedField",
                    "name": "type",
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
    "cacheID": "4609895bc256dec57ed59a69fee1f9dd",
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
        "node._meta.type": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "OntologyClass"
        },
        "node._meta.type._meta": (v4/*:: as any*/),
        "node._meta.type._meta.title": (v3/*:: as any*/),
        "node._meta.type.uri": (v5/*:: as any*/),
        "node.uri": (v5/*:: as any*/)
      }
    },
    "name": "ModifierGraphNodeSsrTestQuery",
    "operationKind": "query",
    "text": "query ModifierGraphNodeSsrTestQuery {\n  node(id: \"ssr\") {\n    __typename\n    ...ModifierGraphNode_node\n    uri\n  }\n}\n\nfragment ModifierGraphNode_node on Modifier {\n  __typename\n  _meta {\n    title\n    curie\n    type {\n      _meta {\n        title\n      }\n      uri\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "55ae7432ec215cc05f3ae75555f82a72";

export default node;
