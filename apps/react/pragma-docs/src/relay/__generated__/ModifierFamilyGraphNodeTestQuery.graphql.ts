/**
 * @generated SignedSource<<27c909f6fbd93bb8044328dc4a3ad989>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ModifierFamilyGraphNodeTestQuery$variables = Record<PropertyKey, never>;
export type ModifierFamilyGraphNodeTestQuery$data = {
  readonly node: {
    readonly ModifierFamilyGraphNode_node: {
      readonly " $fragmentSpreads": FragmentRefs<"ModifierFamilyGraphNode_node">;
    } | null | undefined;
  } | null | undefined;
};
export type ModifierFamilyGraphNodeTestQuery = {
  response: ModifierFamilyGraphNodeTestQuery$data;
  variables: ModifierFamilyGraphNodeTestQuery$variables;
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
    "name": "ModifierFamilyGraphNodeTestQuery",
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
                  "name": "ModifierFamilyGraphNode_node"
                }
              ],
              "type": "ModifierFamily",
              "abstractKey": null
            },
            "kind": "AliasedInlineFragmentSpread",
            "name": "ModifierFamilyGraphNode_node"
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
    "name": "ModifierFamilyGraphNodeTestQuery",
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
            "type": "ModifierFamily",
            "abstractKey": null
          }
        ],
        "storageKey": "node(id:\"test\")"
      }
    ]
  },
  "params": {
    "cacheID": "5722c2dd0c6e8e19920d650d112ccb3c",
    "id": null,
    "metadata": {
      "relayTestingSelectionTypeInfo": {
        "node": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "Node"
        },
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
    "name": "ModifierFamilyGraphNodeTestQuery",
    "operationKind": "query",
    "text": "query ModifierFamilyGraphNodeTestQuery {\n  node(id: \"test\") {\n    __typename\n    ...ModifierFamilyGraphNode_node\n    uri\n  }\n}\n\nfragment ModifierFamilyGraphNode_node on ModifierFamily {\n  __typename\n  _meta {\n    title\n    curie\n  }\n}\n"
  }
};
})();

(node as any).hash = "b5eb278457fcc4d2f43ddcc69d281370";

export default node;
