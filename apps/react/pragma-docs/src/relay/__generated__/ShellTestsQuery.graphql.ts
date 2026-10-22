/**
 * @generated SignedSource<<da205336a4a0498ac4e5bad9133cd9dc>>
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
    readonly " $fragmentSpreads": FragmentRefs<"EntityChip_node">;
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
],
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "uri",
  "storageKey": null
};
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
            "name": "EntityChip_node"
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
                "name": "curie",
                "storageKey": null
              },
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
                "concreteType": "OntologyClass",
                "kind": "LinkedField",
                "name": "type",
                "plural": false,
                "selections": [
                  (v2/*:: as any*/)
                ],
                "storageKey": null
              }
            ],
            "storageKey": null
          },
          (v2/*:: as any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "8f4ba50404cd473b3f5c3412397f9945",
    "id": null,
    "metadata": {},
    "name": "ShellTestsQuery",
    "operationKind": "query",
    "text": "query ShellTestsQuery(\n  $id: ID!\n) {\n  node(id: $id) {\n    __typename\n    ...EntityChip_node\n    uri\n  }\n}\n\nfragment EntityChip_node on Node {\n  __isNode: __typename\n  __typename\n  _meta {\n    curie\n  }\n  ...NodeChip_node\n}\n\nfragment NodeChip_node on Node {\n  __isNode: __typename\n  _meta {\n    title\n    curie\n    type {\n      uri\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "8de286debcd39f25d301389635fc9a61";

export default node;
