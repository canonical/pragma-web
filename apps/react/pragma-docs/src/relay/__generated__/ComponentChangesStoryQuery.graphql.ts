/**
 * @generated SignedSource<<7e36ce9257b9b0623bbece55b4930f50>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ComponentChangesStoryQuery$variables = Record<PropertyKey, never>;
export type ComponentChangesStoryQuery$data = {
  readonly component: {
    readonly " $fragmentSpreads": FragmentRefs<"ComponentChanges_node">;
  } | null | undefined;
};
export type ComponentChangesStoryQuery = {
  response: ComponentChangesStoryQuery$data;
  variables: ComponentChangesStoryQuery$variables;
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
    "name": "ComponentChangesStoryQuery",
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
            "name": "ComponentChanges_node"
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
    "name": "ComponentChangesStoryQuery",
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
            "concreteType": "ChangeLogEntry",
            "kind": "LinkedField",
            "name": "changeLogs",
            "plural": true,
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
                "kind": "ScalarField",
                "name": "change",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "changeType",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "timestamp",
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
    "cacheID": "07c318aada1c7ea908248240b728cf59",
    "id": null,
    "metadata": {
      "relayTestingSelectionTypeInfo": {
        "component": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "Component"
        },
        "component.changeLogs": {
          "enumValues": null,
          "nullable": false,
          "plural": true,
          "type": "ChangeLogEntry"
        },
        "component.changeLogs.change": (v1/*:: as any*/),
        "component.changeLogs.changeType": (v1/*:: as any*/),
        "component.changeLogs.summary": (v1/*:: as any*/),
        "component.changeLogs.timestamp": (v1/*:: as any*/),
        "component.changeLogs.version": (v1/*:: as any*/),
        "component.uri": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "ID"
        }
      }
    },
    "name": "ComponentChangesStoryQuery",
    "operationKind": "query",
    "text": "query ComponentChangesStoryQuery {\n  component(uri: \"ds:global.component.button\") {\n    ...ComponentChanges_node\n    uri\n  }\n}\n\nfragment ComponentChanges_node on Component {\n  changeLogs {\n    version\n    summary\n    change\n    changeType\n    timestamp\n  }\n}\n"
  }
};
})();

(node as any).hash = "0df359b38c8b5bbad0816949390f5190";

export default node;
