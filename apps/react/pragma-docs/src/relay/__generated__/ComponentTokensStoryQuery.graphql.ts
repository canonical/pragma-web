/**
 * @generated SignedSource<<79eaec6241c136ca13e96ba088574ef2>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ComponentTokensStoryQuery$variables = Record<PropertyKey, never>;
export type ComponentTokensStoryQuery$data = {
  readonly component: {
    readonly " $fragmentSpreads": FragmentRefs<"ComponentTokens_node">;
  } | null | undefined;
};
export type ComponentTokensStoryQuery = {
  response: ComponentTokensStoryQuery$data;
  variables: ComponentTokensStoryQuery$variables;
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
    "name": "ComponentTokensStoryQuery",
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
            "name": "ComponentTokens_node"
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
    "name": "ComponentTokensStoryQuery",
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
            "args": null,
            "concreteType": "TokenBinding",
            "kind": "LinkedField",
            "name": "tokenBindings",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "node",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "consumesSymbol",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "rank",
                "storageKey": null
              }
            ],
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "uri",
            "storageKey": null
          }
        ],
        "storageKey": "component(uri:\"ds:global.component.button\")"
      }
    ]
  },
  "params": {
    "cacheID": "291a4e90e5ad27be6bac1ed2cbc7d82a",
    "id": null,
    "metadata": {
      "relayTestingSelectionTypeInfo": {
        "component": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "Component"
        },
        "component.tokenBindings": {
          "enumValues": null,
          "nullable": false,
          "plural": true,
          "type": "TokenBinding"
        },
        "component.tokenBindings.consumesSymbol": (v1/*:: as any*/),
        "component.tokenBindings.node": (v1/*:: as any*/),
        "component.tokenBindings.rank": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "Int"
        },
        "component.uri": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "ID"
        }
      }
    },
    "name": "ComponentTokensStoryQuery",
    "operationKind": "query",
    "text": "query ComponentTokensStoryQuery {\n  component(uri: \"ds:global.component.button\") {\n    ...ComponentTokens_node\n    uri\n  }\n}\n\nfragment ComponentTokens_node on Component {\n  tokenBindings {\n    node\n    consumesSymbol\n    rank\n  }\n}\n"
  }
};
})();

(node as any).hash = "02bc21e7b2e84b79fae02c695cdd36e1";

export default node;
