/**
 * @generated SignedSource<<20b653efd13d5a80862b8abd94d714c8>>
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
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "name",
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
    "cacheID": "75c916c4409ea6a3ce37f2e38e1fd119",
    "id": null,
    "metadata": {
      "relayTestingSelectionTypeInfo": {
        "component": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "Component"
        },
        "component._meta": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "EntityMeta"
        },
        "component._meta.curie": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "String"
        },
        "component.name": (v1/*:: as any*/),
        "component.summary": (v1/*:: as any*/),
        "component.uri": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "ID"
        }
      }
    },
    "name": "ComponentHeaderStoryQuery",
    "operationKind": "query",
    "text": "query ComponentHeaderStoryQuery {\n  component(uri: \"ds:global.component.button\") {\n    ...ComponentHeader_node\n    uri\n  }\n}\n\nfragment ComponentHeader_node on Component {\n  name\n  summary\n  _meta {\n    curie\n  }\n}\n"
  }
};
})();

(node as any).hash = "11ae619f89088d16631b8432f0e60349";

export default node;
