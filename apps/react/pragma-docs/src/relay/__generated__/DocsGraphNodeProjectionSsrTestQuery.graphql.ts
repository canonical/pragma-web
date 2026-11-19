/**
 * @generated SignedSource<<cc4edb9bf83dbdaa54c3453d67a9cf2c>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type DocsGraphNodeProjectionSsrTestQuery$variables = Record<PropertyKey, never>;
export type DocsGraphNodeProjectionSsrTestQuery$data = {
  readonly node: {
    readonly DocsGraphNodeProjection_node: {
      readonly " $fragmentSpreads": FragmentRefs<"DocsGraphNodeProjection_node">;
    };
  } | null | undefined;
};
export type DocsGraphNodeProjectionSsrTestQuery = {
  response: DocsGraphNodeProjectionSsrTestQuery$data;
  variables: DocsGraphNodeProjectionSsrTestQuery$variables;
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
    "name": "DocsGraphNodeProjectionSsrTestQuery",
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
    "name": "DocsGraphNodeProjectionSsrTestQuery",
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
        "storageKey": "node(id:\"ssr\")"
      }
    ]
  },
  "params": {
    "cacheID": "92e2e96558e6688fcad799596eb48f71",
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
    "name": "DocsGraphNodeProjectionSsrTestQuery",
    "operationKind": "query",
    "text": "query DocsGraphNodeProjectionSsrTestQuery {\n  node(id: \"ssr\") {\n    __typename\n    ...DocsGraphNodeProjection_node\n    uri\n  }\n}\n\nfragment CodeStandardGraphNode_node on CodeStandard {\n  __typename\n  _meta {\n    title\n    curie\n  }\n}\n\nfragment DocsGraphNodeProjection_node on Node {\n  __isNode: __typename\n  __typename\n  ...NodeGraphNode_node\n  ...OntologyClassGraphNode_node\n  ... on Component {\n    ...UIBlockGraphNode_node\n  }\n  ... on Pattern {\n    ...UIBlockGraphNode_node\n  }\n  ... on Layout {\n    ...UIBlockGraphNode_node\n  }\n  ...ModifierGraphNode_node\n  ...ModifierFamilyGraphNode_node\n  ...CodeStandardGraphNode_node\n}\n\nfragment ModifierFamilyGraphNode_node on ModifierFamily {\n  __typename\n  _meta {\n    title\n    curie\n  }\n}\n\nfragment ModifierGraphNode_node on Modifier {\n  __typename\n  _meta {\n    title\n    curie\n  }\n}\n\nfragment NodeGraphNode_node on Node {\n  __isNode: __typename\n  __typename\n  _meta {\n    title\n    curie\n    type {\n      _meta {\n        title\n      }\n      uri\n    }\n  }\n}\n\nfragment OntologyClassGraphNode_node on OntologyClass {\n  __typename\n  isAbstract\n  _meta {\n    title\n    curie\n  }\n}\n\nfragment UIBlockGraphNode_node on UIBlock {\n  __isUIBlock: __typename\n  __typename\n  _meta {\n    title\n    curie\n  }\n}\n"
  }
};
})();

(node as any).hash = "b7c6946ee8f6af507ac28ac174fd51e3";

export default node;
