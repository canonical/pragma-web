/**
 * @generated SignedSource<<9d8e777b663f914fd9d2b0b6acfe7c20>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type UIBlockCommandStoryQuery$variables = Record<PropertyKey, never>;
export type UIBlockCommandStoryQuery$data = {
  readonly node: {
    readonly UIBlockCommand_node: {
      readonly " $fragmentSpreads": FragmentRefs<"UIBlockCommand_node">;
    } | null | undefined;
  } | null | undefined;
};
export type UIBlockCommandStoryQuery = {
  response: UIBlockCommandStoryQuery$data;
  variables: UIBlockCommandStoryQuery$variables;
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
v3 = [
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
v4 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "String"
},
v5 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "EntityMeta"
},
v6 = {
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
    "name": "UIBlockCommandStoryQuery",
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
                  "name": "UIBlockCommand_node"
                }
              ],
              "type": "UIBlock",
              "abstractKey": "__isUIBlock"
            },
            "kind": "AliasedInlineFragmentSpread",
            "name": "UIBlockCommand_node"
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
    "name": "UIBlockCommandStoryQuery",
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
                "kind": "ScalarField",
                "name": "version",
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
                    "selections": (v3/*:: as any*/),
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
                "selections": (v3/*:: as any*/),
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
                        "selections": (v3/*:: as any*/),
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
    "cacheID": "4ec45e7bcfbf1f6e77084a15ae0d20f5",
    "id": null,
    "metadata": {
      "relayTestingSelectionTypeInfo": {
        "node": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "Node"
        },
        "node.__isUIBlock": (v4/*:: as any*/),
        "node.__typename": (v4/*:: as any*/),
        "node._meta": (v5/*:: as any*/),
        "node._meta.curie": (v4/*:: as any*/),
        "node._meta.title": (v4/*:: as any*/),
        "node._meta.type": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "OntologyClass"
        },
        "node._meta.type._meta": (v5/*:: as any*/),
        "node._meta.type._meta.title": (v4/*:: as any*/),
        "node._meta.type.uri": (v6/*:: as any*/),
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
        "node.documentationStages.edges.node._meta": (v5/*:: as any*/),
        "node.documentationStages.edges.node._meta.title": (v4/*:: as any*/),
        "node.documentationStages.edges.node.uri": (v6/*:: as any*/),
        "node.tier": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "Tier"
        },
        "node.tier._meta": (v5/*:: as any*/),
        "node.tier._meta.title": (v4/*:: as any*/),
        "node.tier.uri": (v6/*:: as any*/),
        "node.uri": (v6/*:: as any*/),
        "node.version": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "String"
        }
      }
    },
    "name": "UIBlockCommandStoryQuery",
    "operationKind": "query",
    "text": "query UIBlockCommandStoryQuery {\n  node(id: \"story\") {\n    __typename\n    ...UIBlockCommand_node\n    uri\n  }\n}\n\nfragment UIBlockCommand_node on UIBlock {\n  __isUIBlock: __typename\n  __typename\n  version\n  _meta {\n    title\n    curie\n    type {\n      _meta {\n        title\n      }\n      uri\n    }\n  }\n  tier {\n    _meta {\n      title\n    }\n    uri\n  }\n  documentationStages(first: 1) {\n    edges {\n      node {\n        _meta {\n          title\n        }\n        uri\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "321e472d5db6d548cc9a904cf0726c0b";

export default node;
