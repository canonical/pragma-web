/**
 * @generated SignedSource<<d3b0277d17e27e4ca41c0a3d75f3ec42>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ComponentHeaderStoryQuery$variables = Record<PropertyKey, never>;
export type ComponentHeaderStoryQuery$data = {
  readonly component: {
    readonly " $fragmentSpreads": FragmentRefs<"ComponentHeader_node">;
  } | null | undefined;
};
export type ComponentHeaderStoryQuery = {
  response: ComponentHeaderStoryQuery$data;
  variables: ComponentHeaderStoryQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "kind": "Literal",
    "name": "uri",
    "value": "ds:global.component.button"
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
  "name": "name",
  "storageKey": null
},
v3 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "EntityMeta"
},
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
  "type": "ID"
},
v6 = {
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
    "name": "ComponentHeaderStoryQuery",
    "selections": [
      {
        "alias": null,
        "args": (v0/*:: as any*/),
        "concreteType": "Component",
        "kind": "LinkedField",
        "name": "component",
        "plural": false,
        "selections": [
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "ComponentHeader_node"
          }
        ],
        "storageKey": "component(uri:\"ds:global.component.button\")"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "ComponentHeaderStoryQuery",
    "selections": [
      {
        "alias": null,
        "args": (v0/*:: as any*/),
        "concreteType": "Component",
        "kind": "LinkedField",
        "name": "component",
        "plural": false,
        "selections": [
          (v1/*:: as any*/),
          (v2/*:: as any*/),
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
            "args": null,
            "concreteType": "Tier",
            "kind": "LinkedField",
            "name": "tier",
            "plural": false,
            "selections": [
              (v2/*:: as any*/),
              (v1/*:: as any*/)
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
        "storageKey": "component(uri:\"ds:global.component.button\")"
      }
    ]
  },
  "params": {
    "cacheID": "19d33b1984efb580ee66072106270b59",
    "id": null,
    "metadata": {
      "relayTestingSelectionTypeInfo": {
        "component": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "Component"
        },
        "component._meta": (v3/*:: as any*/),
        "component._meta.curie": (v4/*:: as any*/),
        "component.documentationStages": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "TagConnection"
        },
        "component.documentationStages.edges": {
          "enumValues": null,
          "nullable": false,
          "plural": true,
          "type": "TagEdge"
        },
        "component.documentationStages.edges.node": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "Tag"
        },
        "component.documentationStages.edges.node._meta": (v3/*:: as any*/),
        "component.documentationStages.edges.node._meta.title": (v4/*:: as any*/),
        "component.documentationStages.edges.node.uri": (v5/*:: as any*/),
        "component.name": (v6/*:: as any*/),
        "component.summary": (v6/*:: as any*/),
        "component.tier": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "Tier"
        },
        "component.tier.name": (v6/*:: as any*/),
        "component.tier.uri": (v5/*:: as any*/),
        "component.uri": (v5/*:: as any*/)
      }
    },
    "name": "ComponentHeaderStoryQuery",
    "operationKind": "query",
    "text": "query ComponentHeaderStoryQuery {\n  component(uri: \"ds:global.component.button\") {\n    ...ComponentHeader_node\n    uri\n  }\n}\n\nfragment ComponentHeader_node on Component {\n  uri\n  name\n  summary\n  _meta {\n    curie\n  }\n  tier {\n    name\n    uri\n  }\n  documentationStages(first: 1) {\n    edges {\n      node {\n        _meta {\n          title\n        }\n        uri\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "11ae619f89088d16631b8432f0e60349";

export default node;
