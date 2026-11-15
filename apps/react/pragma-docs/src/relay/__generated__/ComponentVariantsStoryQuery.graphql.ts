/**
 * @generated SignedSource<<d8b5c9f1ab25eed6aec3b0afd04f4625>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ComponentVariantsStoryQuery$variables = Record<PropertyKey, never>;
export type ComponentVariantsStoryQuery$data = {
  readonly component: {
    readonly " $fragmentSpreads": FragmentRefs<"ComponentVariants_node">;
  } | null | undefined;
};
export type ComponentVariantsStoryQuery = {
  response: ComponentVariantsStoryQuery$data;
  variables: ComponentVariantsStoryQuery$variables;
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
  "nullable": true,
  "plural": false,
  "type": "String"
},
v4 = {
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
    "name": "ComponentVariantsStoryQuery",
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
            "args": [
              {
                "kind": "Literal",
                "name": "count",
                "value": 24
              }
            ],
            "kind": "FragmentSpread",
            "name": "ComponentVariants_node"
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
    "name": "ComponentVariantsStoryQuery",
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
            "alias": null,
            "args": [
              {
                "kind": "Literal",
                "name": "first",
                "value": 24
              }
            ],
            "concreteType": "ModifierFamilyConnection",
            "kind": "LinkedField",
            "name": "modifierFamilies",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "ModifierFamilyEdge",
                "kind": "LinkedField",
                "name": "edges",
                "plural": true,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "ModifierFamily",
                    "kind": "LinkedField",
                    "name": "node",
                    "plural": false,
                    "selections": [
                      (v1/*:: as any*/),
                      (v2/*:: as any*/),
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
                                  (v1/*:: as any*/),
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
                    "storageKey": null
                  }
                ],
                "storageKey": null
              }
            ],
            "storageKey": "modifierFamilies(first:24)"
          },
          (v1/*:: as any*/)
        ],
        "storageKey": "component(uri:\"ds:global.component.button\")"
      }
    ]
  },
  "params": {
    "cacheID": "f469aea8c90147240e3af91cd49b0f75",
    "id": null,
    "metadata": {
      "relayTestingSelectionTypeInfo": {
        "component": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "Component"
        },
        "component.modifierFamilies": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "ModifierFamilyConnection"
        },
        "component.modifierFamilies.edges": {
          "enumValues": null,
          "nullable": false,
          "plural": true,
          "type": "ModifierFamilyEdge"
        },
        "component.modifierFamilies.edges.node": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "ModifierFamily"
        },
        "component.modifierFamilies.edges.node.modifiers": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "ModifierConnection"
        },
        "component.modifierFamilies.edges.node.modifiers.edges": {
          "enumValues": null,
          "nullable": false,
          "plural": true,
          "type": "ModifierEdge"
        },
        "component.modifierFamilies.edges.node.modifiers.edges.node": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "Modifier"
        },
        "component.modifierFamilies.edges.node.modifiers.edges.node.name": (v3/*:: as any*/),
        "component.modifierFamilies.edges.node.modifiers.edges.node.uri": (v4/*:: as any*/),
        "component.modifierFamilies.edges.node.name": (v3/*:: as any*/),
        "component.modifierFamilies.edges.node.uri": (v4/*:: as any*/),
        "component.uri": (v4/*:: as any*/)
      }
    },
    "name": "ComponentVariantsStoryQuery",
    "operationKind": "query",
    "text": "query ComponentVariantsStoryQuery {\n  component(uri: \"ds:global.component.button\") {\n    ...ComponentVariants_node_2bxhYB\n    uri\n  }\n}\n\nfragment ComponentVariants_node_2bxhYB on Component {\n  modifierFamilies(first: 24) {\n    edges {\n      node {\n        uri\n        name\n        modifiers(first: 100) {\n          edges {\n            node {\n              uri\n              name\n            }\n          }\n        }\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "662c0daa3fa2075c562bc82f685a39ef";

export default node;
