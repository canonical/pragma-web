/**
 * @generated SignedSource<<8bda1ed471e967ef3157d849e0116b2f>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type CodeStandardRowTestQuery$variables = Record<PropertyKey, never>;
export type CodeStandardRowTestQuery$data = {
  readonly node: {
    readonly CodeStandardRow_node: {
      readonly " $fragmentSpreads": FragmentRefs<"CodeStandardRow_node">;
    } | null | undefined;
  } | null | undefined;
};
export type CodeStandardRowTestQuery = {
  response: CodeStandardRowTestQuery$data;
  variables: CodeStandardRowTestQuery$variables;
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
    "name": "CodeStandardRowTestQuery",
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
    "name": "CodeStandardRowTestQuery",
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
        "storageKey": "node(id:\"test\")"
      }
    ]
  },
  "params": {
    "cacheID": "b2696cc0d691dd3d1195017d0e619ff8",
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
    "name": "CodeStandardRowTestQuery",
    "operationKind": "query",
    "text": "query CodeStandardRowTestQuery {\n  node(id: \"test\") {\n    __typename\n    ...CodeStandardRow_node\n    uri\n  }\n}\n\nfragment CodeStandardRow_node on CodeStandard {\n  __typename\n  _meta {\n    title\n    curie\n  }\n  categories(first: 1) {\n    edges {\n      node {\n        _meta {\n          title\n        }\n        uri\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "f601c58a2b72811cf17577d62380e368";

export default node;
