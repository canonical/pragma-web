/**
 * @generated SignedSource<<184e5ea671b79fe1d87114f6a826cfeb>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type DocsGraphNodeProjectionTestQuery$variables = Record<PropertyKey, never>;
export type DocsGraphNodeProjectionTestQuery$data = {
  readonly node: {
    readonly DocsGraphNodeProjection_node: {
      readonly " $fragmentSpreads": FragmentRefs<"DocsGraphNodeProjection_node">;
    };
  } | null | undefined;
};
export type DocsGraphNodeProjectionTestQuery = {
  response: DocsGraphNodeProjectionTestQuery$data;
  variables: DocsGraphNodeProjectionTestQuery$variables;
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
    "kind": "TypeDiscriminator",
    "abstractKey": "__isUIBlock"
  }
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
    "name": "DocsGraphNodeProjectionTestQuery",
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
                  "name": "DocsGraphNodeProjection_node"
                }
              ],
              "type": "Node",
              "abstractKey": "__isNode"
            },
            "kind": "AliasedInlineFragmentSpread",
            "name": "DocsGraphNodeProjection_node"
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
    "name": "DocsGraphNodeProjectionTestQuery",
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
                "selections": [
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
              }
            ],
            "type": "OntologyClass",
            "abstractKey": null
          },
          {
            "kind": "InlineFragment",
            "selections": (v3/*:: as any*/),
            "type": "Component",
            "abstractKey": null
          },
          {
            "kind": "InlineFragment",
            "selections": (v3/*:: as any*/),
            "type": "Pattern",
            "abstractKey": null
          },
          {
            "kind": "InlineFragment",
            "selections": (v3/*:: as any*/),
            "type": "Layout",
            "abstractKey": null
          }
        ],
        "storageKey": "node(id:\"test\")"
      }
    ]
  },
  "params": {
    "cacheID": "4a6e8e00a711a46008689421a5c2717d",
    "id": null,
    "metadata": {
      "relayTestingSelectionTypeInfo": {
        "node": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "Node"
        },
        "node.__isNode": (v4/*:: as any*/),
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
        "node.isAbstract": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "Boolean"
        },
        "node.uri": (v6/*:: as any*/)
      }
    },
    "name": "DocsGraphNodeProjectionTestQuery",
    "operationKind": "query",
    "text": "query DocsGraphNodeProjectionTestQuery {\n  node(id: \"test\") {\n    __typename\n    ...DocsGraphNodeProjection_node\n    uri\n  }\n}\n\nfragment CodeStandardGraphNode_node on CodeStandard {\n  __typename\n  _meta {\n    title\n    curie\n    type {\n      _meta {\n        title\n      }\n      uri\n    }\n  }\n}\n\nfragment DocsGraphNodeProjection_node on Node {\n  __isNode: __typename\n  __typename\n  ...GraphNodeProjection_node\n  ... on Component {\n    ...UIBlockGraphNode_node\n  }\n  ... on Pattern {\n    ...UIBlockGraphNode_node\n  }\n  ... on Layout {\n    ...UIBlockGraphNode_node\n  }\n  ...ModifierGraphNode_node\n  ...ModifierFamilyGraphNode_node\n  ...CodeStandardGraphNode_node\n}\n\nfragment GraphNodeProjection_node on Node {\n  __isNode: __typename\n  __typename\n  ...NodeGraphNode_node\n  ...SiteGraphNodeSlot_node\n  ...OntologyClassGraphNode_node\n}\n\nfragment ModifierFamilyGraphNode_node on ModifierFamily {\n  __typename\n  _meta {\n    title\n    curie\n  }\n}\n\nfragment ModifierGraphNode_node on Modifier {\n  __typename\n  _meta {\n    title\n    curie\n    type {\n      _meta {\n        title\n      }\n      uri\n    }\n  }\n}\n\nfragment NodeGraphNode_node on Node {\n  __isNode: __typename\n  __typename\n  _meta {\n    title\n    curie\n    type {\n      _meta {\n        title\n      }\n      uri\n    }\n  }\n}\n\nfragment OntologyClassGraphNode_node on OntologyClass {\n  __typename\n  isAbstract\n  _meta {\n    title\n    curie\n  }\n}\n\nfragment SiteGraphNodeSlot_node on Node {\n  __isNode: __typename\n  __typename\n}\n\nfragment UIBlockGraphNode_node on UIBlock {\n  __isUIBlock: __typename\n  __typename\n  _meta {\n    title\n    curie\n  }\n}\n"
  }
};
})();

(node as any).hash = "4d7d7159724a3e9460cb41fdb4ef4433";

export default node;
