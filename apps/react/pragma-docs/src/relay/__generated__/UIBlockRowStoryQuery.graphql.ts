/**
 * @generated SignedSource<<0c02ee66cf93640a245d1150e197337b>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type UIBlockRowStoryQuery$variables = Record<PropertyKey, never>;
export type UIBlockRowStoryQuery$data = {
  readonly node: {
    readonly UIBlockRow_node: {
      readonly " $fragmentSpreads": FragmentRefs<"UIBlockRow_node">;
    } | null | undefined;
  } | null | undefined;
};
export type UIBlockRowStoryQuery = {
  response: UIBlockRowStoryQuery$data;
  variables: UIBlockRowStoryQuery$variables;
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
    "name": "UIBlockRowStoryQuery",
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
                  "name": "UIBlockRow_node"
                }
              ],
              "type": "UIBlock",
              "abstractKey": "__isUIBlock"
            },
            "kind": "AliasedInlineFragmentSpread",
            "name": "UIBlockRow_node"
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
    "name": "UIBlockRowStoryQuery",
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
                "args": [
                  {
                    "kind": "Literal",
                    "name": "first",
                    "value": 1
                  }
                ],
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
                "storageKey": "documentationStages(first:1)"
              }
            ],
            "type": "UIBlock",
            "abstractKey": "__isUIBlock"
          }
        ],
        "storageKey": "node(id:\"story\")"
      }
    ]
  },
  "params": {
    "cacheID": "2ba128ab225b0154a19f45577450e29c",
    "id": null,
    "metadata": {
      "relayTestingSelectionTypeInfo": {
        "node": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "Node"
        },
        "node.__isUIBlock": (v3/*:: as any*/),
        "node.__typename": (v3/*:: as any*/),
        "node._meta": (v4/*:: as any*/),
        "node._meta.curie": (v3/*:: as any*/),
        "node._meta.title": (v3/*:: as any*/),
        "node.documentationStages": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "TagConnection"
        },
        "node.documentationStages.edges": {
          "enumValues": null,
          "nullable": false,
          "plural": true,
          "type": "TagEdge"
        },
        "node.documentationStages.edges.node": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "Tag"
        },
        "node.documentationStages.edges.node._meta": (v4/*:: as any*/),
        "node.documentationStages.edges.node._meta.title": (v3/*:: as any*/),
        "node.documentationStages.edges.node.uri": (v5/*:: as any*/),
        "node.uri": (v5/*:: as any*/)
      }
    },
    "name": "UIBlockRowStoryQuery",
    "operationKind": "query",
    "text": "query UIBlockRowStoryQuery {\n  node(id: \"story\") {\n    __typename\n    ...UIBlockRow_node\n    uri\n  }\n}\n\nfragment UIBlockRow_node on UIBlock {\n  __isUIBlock: __typename\n  __typename\n  _meta {\n    title\n    curie\n  }\n  documentationStages(first: 1) {\n    edges {\n      node {\n        _meta {\n          title\n        }\n        uri\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "759821174d8ff3ac55306ea37a8b60e0";

export default node;
