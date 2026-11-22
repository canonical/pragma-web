/**
 * @generated SignedSource<<c468dc62832d4a5eabf59c16b95257a7>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type EntityFacetScopeQuery$variables = {
  classId: string;
};
export type EntityFacetScopeQuery$data = {
  readonly facetedInstances: {
    readonly facets: ReadonlyArray<{
      readonly field: string;
    }>;
  };
  readonly ontologies: ReadonlyArray<{
    readonly namespace: string;
    readonly prefix: string;
  }>;
};
export type EntityFacetScopeQuery = {
  response: EntityFacetScopeQuery$data;
  variables: EntityFacetScopeQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "classId"
  }
],
v1 = [
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
  },
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "classUri",
        "variableName": "classId"
      },
      {
        "kind": "Literal",
        "name": "first",
        "value": 0
      }
    ],
    "concreteType": "FacetedConnection",
    "kind": "LinkedField",
    "name": "facetedInstances",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "Facet",
        "kind": "LinkedField",
        "name": "facets",
        "plural": true,
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "field",
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ],
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "EntityFacetScopeQuery",
    "selections": (v1/*:: as any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Operation",
    "name": "EntityFacetScopeQuery",
    "selections": (v1/*:: as any*/)
  },
  "params": {
    "cacheID": "1a6c67bd2708e447c834e13569944e6f",
    "id": null,
    "metadata": {},
    "name": "EntityFacetScopeQuery",
    "operationKind": "query",
    "text": "query EntityFacetScopeQuery(\n  $classId: ID!\n) {\n  ontologies {\n    prefix\n    namespace\n  }\n  facetedInstances(classUri: $classId, first: 0) {\n    facets {\n      field\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "86b727c6ac229457182d1d9eafedb609";

export default node;
