/**
 * @generated SignedSource<<a86706791543222f6804725565d11382>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type UIBlockCardSsrTestQuery$variables = Record<PropertyKey, never>;
export type UIBlockCardSsrTestQuery$data = {
  readonly node: {
    readonly UIBlockCard_node: {
      readonly " $fragmentSpreads": FragmentRefs<"UIBlockCard_node">;
    } | null | undefined;
  } | null | undefined;
};
export type UIBlockCardSsrTestQuery = {
  response: UIBlockCardSsrTestQuery$data;
  variables: UIBlockCardSsrTestQuery$variables;
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
  "name": "__typename",
  "storageKey": null
},
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "uri",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "title",
  "storageKey": null
},
v4 = {
  "alias": null,
  "args": null,
  "concreteType": "EntityMeta",
  "kind": "LinkedField",
  "name": "_meta",
  "plural": false,
  "selections": [
    (v3/*:: as any*/)
  ],
  "storageKey": null
},
v5 = [
  (v4/*:: as any*/),
  (v2/*:: as any*/)
],
v6 = [
  {
    "kind": "Literal",
    "name": "first",
    "value": 1
  }
],
v7 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "String"
},
v8 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "EntityMeta"
},
v9 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "ID"
},
v10 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "String"
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "UIBlockCardSsrTestQuery",
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
                  "name": "UIBlockCard_node"
                }
              ],
              "type": "UIBlock",
              "abstractKey": "__isUIBlock"
            },
            "kind": "AliasedInlineFragmentSpread",
            "name": "UIBlockCard_node"
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
    "name": "UIBlockCardSsrTestQuery",
    "selections": [
      {
        "alias": null,
        "args": (v0/*:: as any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          (v1/*:: as any*/),
          (v2/*:: as any*/),
          {
            "kind": "InlineFragment",
            "selections": [
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "version",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "summary",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "concreteType": "EntityMeta",
                "kind": "LinkedField",
                "name": "_meta",
                "plural": false,
                "selections": [
                  (v3/*:: as any*/),
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
                    "selections": (v5/*:: as any*/),
                    "storageKey": null
                  }
                ],
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "concreteType": "Tier",
                "kind": "LinkedField",
                "name": "tier",
                "plural": false,
                "selections": (v5/*:: as any*/),
                "storageKey": null
              },
              {
                "alias": null,
                "args": (v6/*:: as any*/),
                "concreteType": "UIBlockConnection",
                "kind": "LinkedField",
                "name": "inheritsFroms",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "UIBlockEdge",
                    "kind": "LinkedField",
                    "name": "edges",
                    "plural": true,
                    "selections": [
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": null,
                        "kind": "LinkedField",
                        "name": "node",
                        "plural": false,
                        "selections": [
                          (v1/*:: as any*/),
                          (v4/*:: as any*/),
                          (v2/*:: as any*/)
                        ],
                        "storageKey": null
                      }
                    ],
                    "storageKey": null
                  }
                ],
                "storageKey": "inheritsFroms(first:1)"
              },
              {
                "alias": null,
                "args": (v6/*:: as any*/),
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
                        "selections": (v5/*:: as any*/),
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
        "storageKey": "node(id:\"ssr\")"
      }
    ]
  },
  "params": {
    "cacheID": "a5646baa7e65c4401a26d8169d70508a",
    "id": null,
    "metadata": {
      "relayTestingSelectionTypeInfo": {
        "node": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "Node"
        },
        "node.__isUIBlock": (v7/*:: as any*/),
        "node.__typename": (v7/*:: as any*/),
        "node._meta": (v8/*:: as any*/),
        "node._meta.curie": (v7/*:: as any*/),
        "node._meta.title": (v7/*:: as any*/),
        "node._meta.type": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "OntologyClass"
        },
        "node._meta.type._meta": (v8/*:: as any*/),
        "node._meta.type._meta.title": (v7/*:: as any*/),
        "node._meta.type.uri": (v9/*:: as any*/),
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
        "node.documentationStages.edges.node._meta": (v8/*:: as any*/),
        "node.documentationStages.edges.node._meta.title": (v7/*:: as any*/),
        "node.documentationStages.edges.node.uri": (v9/*:: as any*/),
        "node.inheritsFroms": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "UIBlockConnection"
        },
        "node.inheritsFroms.edges": {
          "enumValues": null,
          "nullable": false,
          "plural": true,
          "type": "UIBlockEdge"
        },
        "node.inheritsFroms.edges.node": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "UIBlock"
        },
        "node.inheritsFroms.edges.node.__typename": (v7/*:: as any*/),
        "node.inheritsFroms.edges.node._meta": (v8/*:: as any*/),
        "node.inheritsFroms.edges.node._meta.title": (v7/*:: as any*/),
        "node.inheritsFroms.edges.node.uri": (v9/*:: as any*/),
        "node.summary": (v10/*:: as any*/),
        "node.tier": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "Tier"
        },
        "node.tier._meta": (v8/*:: as any*/),
        "node.tier._meta.title": (v7/*:: as any*/),
        "node.tier.uri": (v9/*:: as any*/),
        "node.uri": (v9/*:: as any*/),
        "node.version": (v10/*:: as any*/)
      }
    },
    "name": "UIBlockCardSsrTestQuery",
    "operationKind": "query",
    "text": "query UIBlockCardSsrTestQuery {\n  node(id: \"ssr\") {\n    __typename\n    ...UIBlockCard_node\n    uri\n  }\n}\n\nfragment UIBlockCard_node on UIBlock {\n  __isUIBlock: __typename\n  __typename\n  version\n  summary\n  _meta {\n    title\n    curie\n    type {\n      _meta {\n        title\n      }\n      uri\n    }\n  }\n  tier {\n    _meta {\n      title\n    }\n    uri\n  }\n  inheritsFroms(first: 1) {\n    edges {\n      node {\n        __typename\n        _meta {\n          title\n        }\n        uri\n      }\n    }\n  }\n  documentationStages(first: 1) {\n    edges {\n      node {\n        _meta {\n          title\n        }\n        uri\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "6373b84e889186c46643b894488bc265";

export default node;
