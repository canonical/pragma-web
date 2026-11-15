/**
 * @generated SignedSource<<caa18b2a5589db297391a9533e3c5f91>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type CodeStandardGraphNodeStoryQuery$variables = Record<PropertyKey, never>;
export type CodeStandardGraphNodeStoryQuery$data = {
  readonly node: {
    readonly CodeStandardGraphNode_node: {
      readonly " $fragmentSpreads": FragmentRefs<"CodeStandardGraphNode_node">;
    } | null | undefined;
  } | null | undefined;
};
export type CodeStandardGraphNodeStoryQuery = {
  response: CodeStandardGraphNodeStoryQuery$data;
  variables: CodeStandardGraphNodeStoryQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "kind": "Literal",
    "name": "id",
    "value": "story"
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
    "name": "CodeStandardGraphNodeStoryQuery",
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
                  "name": "CodeStandardGraphNode_node"
                }
              ],
              "type": "CodeStandard",
              "abstractKey": null
            },
            "kind": "AliasedInlineFragmentSpread",
            "name": "CodeStandardGraphNode_node"
          }
        ],
        "storageKey": "node(id:\"story\")"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "CodeStandardGraphNodeStoryQuery",
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
            "type": "CodeStandard",
            "abstractKey": null
          }
        ],
        "storageKey": "node(id:\"story\")"
      }
    ]
  },
  "params": {
    "cacheID": "16a4863e503b4b3a09d2b135da5786eb",
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
    "name": "CodeStandardGraphNodeStoryQuery",
    "operationKind": "query",
    "text": "query CodeStandardGraphNodeStoryQuery {\n  node(id: \"story\") {\n    __typename\n    ...CodeStandardGraphNode_node\n    uri\n  }\n}\n\nfragment CodeStandardGraphNode_node on CodeStandard {\n  __typename\n  _meta {\n    title\n    curie\n  }\n}\n"
  }
};
})();

(node as any).hash = "88853d226a117578e0a8a7a356497af0";

export default node;
