/**
 * @generated SignedSource<<94a26f208af6a1396d087a6b611df64c>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ShellTestsQuery$variables = {
  id: string;
};
export type ShellTestsQuery$data = {
  readonly node: {
    readonly " $fragmentSpreads": FragmentRefs<"ChipProjection_node">;
  } | null | undefined;
};
export type ShellTestsQuery = {
  response: ShellTestsQuery$data;
  variables: ShellTestsQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "id"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "id",
    "variableName": "id"
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "ShellTestsQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*:: as any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "ChipProjection_node"
          }
        ],
        "storageKey": null
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Operation",
    "name": "ShellTestsQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*:: as any*/),
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
                "name": "title",
                "storageKey": null
              },
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
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "538c746cffc84e4331c5f5d71c6f2c33",
    "id": null,
    "metadata": {},
    "name": "ShellTestsQuery",
    "operationKind": "query",
    "text": "query ShellTestsQuery(\n  $id: ID!\n) {\n  node(id: $id) {\n    __typename\n    ...ChipProjection_node\n    uri\n  }\n}\n\nfragment ChipProjection_node on Node {\n  __isNode: __typename\n  __typename\n  ...NodeChip_node\n}\n\nfragment NodeChip_node on Node {\n  __isNode: __typename\n  __typename\n  _meta {\n    title\n    curie\n  }\n}\n"
  }
};
})();

(node as any).hash = "b3e95482039812dd5b6b4fda0893ec66";

export default node;
