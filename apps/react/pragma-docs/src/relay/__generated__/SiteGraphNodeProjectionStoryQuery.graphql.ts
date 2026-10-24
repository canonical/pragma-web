/**
 * @generated SignedSource<<2bacb88da4fa5f67bb04ced9931be4ce>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type SiteGraphNodeProjectionStoryQuery$variables = Record<PropertyKey, never>;
export type SiteGraphNodeProjectionStoryQuery$data = {
  readonly node: {
    readonly SiteGraphNodeProjection_node: {
      readonly " $fragmentSpreads": FragmentRefs<"SiteGraphNodeProjection_node">;
    };
  } | null | undefined;
};
export type SiteGraphNodeProjectionStoryQuery = {
  response: SiteGraphNodeProjectionStoryQuery$data;
  variables: SiteGraphNodeProjectionStoryQuery$variables;
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
    }
  ],
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
  (v1/*:: as any*/),
  (v2/*:: as any*/)
],
v4 = [
  {
    "kind": "InlineFragment",
    "selections": [
      (v1/*:: as any*/),
      {
        "alias": null,
        "args": null,
        "concreteType": "Tier",
        "kind": "LinkedField",
        "name": "tier",
        "plural": false,
        "selections": (v3/*:: as any*/),
        "storageKey": null
      }
    ],
    "type": "UIBlock",
    "abstractKey": "__isUIBlock"
  }
],
v5 = [
  (v1/*:: as any*/)
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
    "name": "SiteGraphNodeProjectionStoryQuery",
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
                  "name": "SiteGraphNodeProjection_node"
                }
              ],
              "type": "Node",
              "abstractKey": "__isNode"
            },
            "kind": "AliasedInlineFragmentSpread",
            "name": "SiteGraphNodeProjection_node"
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
    "name": "SiteGraphNodeProjectionStoryQuery",
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
              }
            ],
            "type": "OntologyClass",
            "abstractKey": null
          },
          {
            "kind": "InlineFragment",
            "selections": (v4/*:: as any*/),
            "type": "Component",
            "abstractKey": null
          },
          {
            "kind": "InlineFragment",
            "selections": (v4/*:: as any*/),
            "type": "Pattern",
            "abstractKey": null
          },
          {
            "kind": "InlineFragment",
            "selections": (v4/*:: as any*/),
            "type": "Layout",
            "abstractKey": null
          },
          {
            "kind": "InlineFragment",
            "selections": (v5/*:: as any*/),
            "type": "Modifier",
            "abstractKey": null
          },
          {
            "kind": "InlineFragment",
            "selections": (v5/*:: as any*/),
            "type": "ModifierFamily",
            "abstractKey": null
          },
          {
            "kind": "InlineFragment",
            "selections": (v5/*:: as any*/),
            "type": "CodeStandard",
            "abstractKey": null
          }
        ],
        "storageKey": "node(id:\"story\")"
      }
    ]
  },
  "params": {
    "cacheID": "9a539eca05c2b5b8e617d54df88268f8",
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
        "node.isAbstract": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "Boolean"
        },
        "node.tier": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "Tier"
        },
        "node.tier._meta": (v7/*:: as any*/),
        "node.tier._meta.title": (v6/*:: as any*/),
        "node.tier.uri": (v8/*:: as any*/),
        "node.uri": (v8/*:: as any*/)
      }
    },
    "name": "SiteGraphNodeProjectionStoryQuery",
    "operationKind": "query",
    "text": "query SiteGraphNodeProjectionStoryQuery {\n  node(id: \"story\") {\n    __typename\n    ...SiteGraphNodeProjection_node\n    uri\n  }\n}\n\nfragment CodeStandardGraphNode_node on CodeStandard {\n  __typename\n  _meta {\n    title\n    curie\n    type {\n      _meta {\n        title\n      }\n      uri\n    }\n  }\n}\n\nfragment GraphNodeProjection_node on Node {\n  __isNode: __typename\n  __typename\n  ...NodeGraphNode_node\n  ...OntologyClassGraphNode_node\n}\n\nfragment ModifierFamilyGraphNode_node on ModifierFamily {\n  __typename\n  _meta {\n    title\n    curie\n    type {\n      _meta {\n        title\n      }\n      uri\n    }\n  }\n}\n\nfragment ModifierGraphNode_node on Modifier {\n  __typename\n  _meta {\n    title\n    curie\n    type {\n      _meta {\n        title\n      }\n      uri\n    }\n  }\n}\n\nfragment NodeGraphNode_node on Node {\n  __isNode: __typename\n  __typename\n  _meta {\n    curie\n    type {\n      _meta {\n        title\n      }\n      uri\n    }\n  }\n}\n\nfragment OntologyClassGraphNode_node on OntologyClass {\n  __typename\n  isAbstract\n  _meta {\n    curie\n  }\n}\n\nfragment SiteGraphNodeProjection_node on Node {\n  __isNode: __typename\n  __typename\n  ...GraphNodeProjection_node\n  ... on Component {\n    ...UIBlockGraphNode_node\n  }\n  ... on Pattern {\n    ...UIBlockGraphNode_node\n  }\n  ... on Layout {\n    ...UIBlockGraphNode_node\n  }\n  ...ModifierGraphNode_node\n  ...ModifierFamilyGraphNode_node\n  ...CodeStandardGraphNode_node\n}\n\nfragment UIBlockGraphNode_node on UIBlock {\n  __isUIBlock: __typename\n  __typename\n  _meta {\n    title\n    curie\n    type {\n      _meta {\n        title\n      }\n      uri\n    }\n  }\n  tier {\n    _meta {\n      title\n    }\n    uri\n  }\n}\n"
  }
};
})();

(node as any).hash = "bd5bb86b3cd98d3bfd27bd4156c5c882";

export default node;
