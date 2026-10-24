/**
 * @generated SignedSource<<d78954897ab04f4b0d1894115fc28d61>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type CodeStandardRowSsrTestQuery$variables = Record<PropertyKey, never>;
export type CodeStandardRowSsrTestQuery$data = {
  readonly node: {
    readonly CodeStandardRow_node: {
      readonly " $fragmentSpreads": FragmentRefs<"CodeStandardRow_node">;
    } | null | undefined;
  } | null | undefined;
};
export type CodeStandardRowSsrTestQuery = {
  response: CodeStandardRowSsrTestQuery$data;
  variables: CodeStandardRowSsrTestQuery$variables;
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
    "name": "CodeStandardRowSsrTestQuery",
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
                  "name": "CodeStandardRow_node"
                }
              ],
              "type": "CodeStandard",
              "abstractKey": null
            },
            "kind": "AliasedInlineFragmentSpread",
            "name": "CodeStandardRow_node"
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
    "name": "CodeStandardRowSsrTestQuery",
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
                "storageKey": "categories(first:1)"
              }
            ],
            "type": "CodeStandard",
            "abstractKey": null
          }
        ],
        "storageKey": "node(id:\"ssr\")"
      }
    ]
  },
  "params": {
    "cacheID": "430eb1a828c8f6bde76b0bbe3f21905d",
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
        "node.categories": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "CategoryConnection"
        },
        "node.categories.edges": {
          "enumValues": null,
          "nullable": false,
          "plural": true,
          "type": "CategoryEdge"
        },
        "node.categories.edges.node": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "Category"
        },
        "node.categories.edges.node._meta": (v4/*:: as any*/),
        "node.categories.edges.node._meta.title": (v3/*:: as any*/),
        "node.categories.edges.node.uri": (v5/*:: as any*/),
        "node.uri": (v5/*:: as any*/)
      }
    },
    "name": "CodeStandardRowSsrTestQuery",
    "operationKind": "query",
    "text": "query CodeStandardRowSsrTestQuery {\n  node(id: \"ssr\") {\n    __typename\n    ...CodeStandardRow_node\n    uri\n  }\n}\n\nfragment CodeStandardRow_node on CodeStandard {\n  __typename\n  _meta {\n    title\n    curie\n  }\n  categories(first: 1) {\n    edges {\n      node {\n        _meta {\n          title\n        }\n        uri\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "8a0761709210f3f2fbe920615b4e8c35";

export default node;
