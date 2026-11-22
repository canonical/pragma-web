/**
 * @generated SignedSource<<3b2de5afb647de3354601a2fa1c0d8f2>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type EntityNamespacesQuery$variables = Record<PropertyKey, never>;
export type EntityNamespacesQuery$data = {
  readonly ontologies: ReadonlyArray<{
    readonly namespace: string;
    readonly prefix: string;
  }>;
};
export type EntityNamespacesQuery = {
  response: EntityNamespacesQuery$data;
  variables: EntityNamespacesQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "alias": null,
    "args": null,
    "concreteType": "Ontology",
    "kind": "LinkedField",
    "name": "ontologies",
    "plural": true,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "prefix",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "namespace",
        "storageKey": null
      }
    ],
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "EntityNamespacesQuery",
    "selections": (v0/*:: as any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "EntityNamespacesQuery",
    "selections": (v0/*:: as any*/)
  },
  "params": {
    "cacheID": "4b31a7e318d0353a2338f63acf4c2e66",
    "id": null,
    "metadata": {},
    "name": "EntityNamespacesQuery",
    "operationKind": "query",
    "text": "query EntityNamespacesQuery {\n  ontologies {\n    prefix\n    namespace\n  }\n}\n"
  }
};
})();

(node as any).hash = "aa45229da9723c2baeb52e944aacbb63";

export default node;
