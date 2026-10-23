/**
 * @generated SignedSource<<74c6c3230ee97fbc7a227fb0173e24fc>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type SiteCommandProjectionTestQuery$variables = Record<PropertyKey, never>;
export type SiteCommandProjectionTestQuery$data = {
  readonly node: {
    readonly SiteCommandProjection_node: {
      readonly " $fragmentSpreads": FragmentRefs<"SiteCommandProjection_node">;
    };
  } | null | undefined;
};
export type SiteCommandProjectionTestQuery = {
  response: SiteCommandProjectionTestQuery$data;
  variables: SiteCommandProjectionTestQuery$variables;
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
  "name": "title",
  "storageKey": null
},
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "uri",
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
      (v1/*:: as any*/)
    ],
    "storageKey": null
  },
  (v2/*:: as any*/)
],
v4 = [
  {
    "kind": "Literal",
    "name": "first",
    "value": 1
  }
],
v5 = [
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
        "concreteType": "Tier",
        "kind": "LinkedField",
        "name": "tier",
        "plural": false,
        "selections": (v3/*:: as any*/),
        "storageKey": null
      },
      {
        "alias": null,
        "args": (v4/*:: as any*/),
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
v6 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "String"
},
v7 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "EntityMeta"
},
v8 = {
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
    "name": "SiteCommandProjectionTestQuery",
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
                  "name": "SiteCommandProjection_node"
                }
              ],
              "type": "Node",
              "abstractKey": "__isNode"
            },
            "kind": "AliasedInlineFragmentSpread",
            "name": "SiteCommandProjection_node"
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
    "name": "SiteCommandProjectionTestQuery",
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
            "kind": "TypeDiscriminator",
            "abstractKey": "__isNode"
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "EntityMeta",
            "kind": "LinkedField",
            "name": "_meta",
            "plural": false,
            "selections": [
              (v1/*:: as any*/),
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
          (v2/*:: as any*/),
          {
            "kind": "InlineFragment",
            "selections": [
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "isAbstract",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "instanceCount",
                "storageKey": null
              }
            ],
            "type": "OntologyClass",
            "abstractKey": null
          },
          {
            "kind": "InlineFragment",
            "selections": (v5/*:: as any*/),
            "type": "Component",
            "abstractKey": null
          },
          {
            "kind": "InlineFragment",
            "selections": (v5/*:: as any*/),
            "type": "Pattern",
            "abstractKey": null
          },
          {
            "kind": "InlineFragment",
            "selections": (v5/*:: as any*/),
            "type": "Layout",
            "abstractKey": null
          },
          {
            "kind": "InlineFragment",
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "ModifierFamily",
                "kind": "LinkedField",
                "name": "modifierFamily",
                "plural": false,
                "selections": (v3/*:: as any*/),
                "storageKey": null
              }
            ],
            "type": "Modifier",
            "abstractKey": null
          },
          {
            "kind": "InlineFragment",
            "selections": [
              {
                "alias": null,
                "args": [
                  {
                    "kind": "Literal",
                    "name": "first",
                    "value": 100
                  }
                ],
                "concreteType": "ModifierConnection",
                "kind": "LinkedField",
                "name": "modifiers",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "ModifierEdge",
                    "kind": "LinkedField",
                    "name": "edges",
                    "plural": true,
                    "selections": [
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "Modifier",
                        "kind": "LinkedField",
                        "name": "node",
                        "plural": false,
                        "selections": [
                          (v2/*:: as any*/)
                        ],
                        "storageKey": null
                      }
                    ],
                    "storageKey": null
                  }
                ],
                "storageKey": "modifiers(first:100)"
              }
            ],
            "type": "ModifierFamily",
            "abstractKey": null
          },
          {
            "kind": "InlineFragment",
            "selections": [
              {
                "alias": null,
                "args": (v4/*:: as any*/),
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
                        "selections": (v3/*:: as any*/),
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
    "cacheID": "440b35e10f199e3be41cd90ad9b31323",
    "id": null,
    "metadata": {
      "relayTestingSelectionTypeInfo": {
        "node": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "Node"
        },
        "node.__isNode": (v6/*:: as any*/),
        "node.__isUIBlock": (v6/*:: as any*/),
        "node.__typename": (v6/*:: as any*/),
        "node._meta": (v7/*:: as any*/),
        "node._meta.curie": (v6/*:: as any*/),
        "node._meta.title": (v6/*:: as any*/),
        "node._meta.type": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "OntologyClass"
        },
        "node._meta.type._meta": (v7/*:: as any*/),
        "node._meta.type._meta.title": (v6/*:: as any*/),
        "node._meta.type.uri": (v8/*:: as any*/),
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
        "node.categories.edges.node._meta": (v7/*:: as any*/),
        "node.categories.edges.node._meta.title": (v6/*:: as any*/),
        "node.categories.edges.node.uri": (v8/*:: as any*/),
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
        "node.documentationStages.edges.node._meta": (v7/*:: as any*/),
        "node.documentationStages.edges.node._meta.title": (v6/*:: as any*/),
        "node.documentationStages.edges.node.uri": (v8/*:: as any*/),
        "node.instanceCount": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "Int"
        },
        "node.isAbstract": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "Boolean"
        },
        "node.modifierFamily": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "ModifierFamily"
        },
        "node.modifierFamily._meta": (v7/*:: as any*/),
        "node.modifierFamily._meta.title": (v6/*:: as any*/),
        "node.modifierFamily.uri": (v8/*:: as any*/),
        "node.modifiers": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "ModifierConnection"
        },
        "node.modifiers.edges": {
          "enumValues": null,
          "nullable": false,
          "plural": true,
          "type": "ModifierEdge"
        },
        "node.modifiers.edges.node": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "Modifier"
        },
        "node.modifiers.edges.node.uri": (v8/*:: as any*/),
        "node.tier": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "Tier"
        },
        "node.tier._meta": (v7/*:: as any*/),
        "node.tier._meta.title": (v6/*:: as any*/),
        "node.tier.uri": (v8/*:: as any*/),
        "node.uri": (v8/*:: as any*/),
        "node.version": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "String"
        }
      }
    },
    "name": "SiteCommandProjectionTestQuery",
    "operationKind": "query",
    "text": "query SiteCommandProjectionTestQuery {\n  node(id: \"test\") {\n    __typename\n    ...SiteCommandProjection_node\n    uri\n  }\n}\n\nfragment CodeStandardCommand_node on CodeStandard {\n  __typename\n  _meta {\n    title\n    curie\n    type {\n      _meta {\n        title\n      }\n      uri\n    }\n  }\n  categories(first: 1) {\n    edges {\n      node {\n        _meta {\n          title\n        }\n        uri\n      }\n    }\n  }\n}\n\nfragment CommandProjection_node on Node {\n  __isNode: __typename\n  __typename\n  ...NodeCommand_node\n  ...OntologyClassCommand_node\n}\n\nfragment ModifierCommand_node on Modifier {\n  __typename\n  _meta {\n    title\n    curie\n    type {\n      _meta {\n        title\n      }\n      uri\n    }\n  }\n  modifierFamily {\n    _meta {\n      title\n    }\n    uri\n  }\n}\n\nfragment ModifierFamilyCommand_node on ModifierFamily {\n  __typename\n  _meta {\n    title\n    curie\n    type {\n      _meta {\n        title\n      }\n      uri\n    }\n  }\n  modifiers(first: 100) {\n    edges {\n      node {\n        uri\n      }\n    }\n  }\n}\n\nfragment NodeCommand_node on Node {\n  __isNode: __typename\n  __typename\n  _meta {\n    title\n    curie\n    type {\n      _meta {\n        title\n      }\n      uri\n    }\n  }\n}\n\nfragment OntologyClassCommand_node on OntologyClass {\n  __typename\n  isAbstract\n  instanceCount\n  _meta {\n    title\n    curie\n  }\n}\n\nfragment SiteCommandProjection_node on Node {\n  __isNode: __typename\n  __typename\n  ...CommandProjection_node\n  ... on Component {\n    ...UIBlockCommand_node\n  }\n  ... on Pattern {\n    ...UIBlockCommand_node\n  }\n  ... on Layout {\n    ...UIBlockCommand_node\n  }\n  ...ModifierCommand_node\n  ...ModifierFamilyCommand_node\n  ...CodeStandardCommand_node\n}\n\nfragment UIBlockCommand_node on UIBlock {\n  __isUIBlock: __typename\n  __typename\n  version\n  _meta {\n    title\n    curie\n    type {\n      _meta {\n        title\n      }\n      uri\n    }\n  }\n  tier {\n    _meta {\n      title\n    }\n    uri\n  }\n  documentationStages(first: 1) {\n    edges {\n      node {\n        _meta {\n          title\n        }\n        uri\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "2d311623c05008ed9a5337c22090dc6e";

export default node;
