/**
 * @generated SignedSource<<17f897a15b3500480ed48c638671da1f>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type DocsSearchDoorsQuery$variables = {
  components: string;
  standards: string;
};
export type DocsSearchDoorsQuery$data = {
  readonly components: {
    readonly totalCount: number;
  };
  readonly standards: {
    readonly totalCount: number;
  };
};
export type DocsSearchDoorsQuery = {
  response: DocsSearchDoorsQuery$data;
  variables: DocsSearchDoorsQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "components"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "standards"
  }
],
v1 = {
  "kind": "Literal",
  "name": "first",
  "value": 0
},
v2 = [
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "totalCount",
    "storageKey": null
  }
],
v3 = [
  {
    "alias": "components",
    "args": [
      {
        "kind": "Variable",
        "name": "classUri",
        "variableName": "components"
      },
      (v1/*:: as any*/)
    ],
    "concreteType": "FacetedConnection",
    "kind": "LinkedField",
    "name": "facetedInstances",
    "plural": false,
    "selections": (v2/*:: as any*/),
    "storageKey": null
  },
  {
    "alias": "standards",
    "args": [
      {
        "kind": "Variable",
        "name": "classUri",
        "variableName": "standards"
      },
      (v1/*:: as any*/)
    ],
    "concreteType": "FacetedConnection",
    "kind": "LinkedField",
    "name": "facetedInstances",
    "plural": false,
    "selections": (v2/*:: as any*/),
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "DocsSearchDoorsQuery",
    "selections": (v3/*:: as any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Operation",
    "name": "DocsSearchDoorsQuery",
    "selections": (v3/*:: as any*/)
  },
  "params": {
    "cacheID": "5a2b7f6f62e57442abdeed941ad5e607",
    "id": null,
    "metadata": {},
    "name": "DocsSearchDoorsQuery",
    "operationKind": "query",
    "text": "query DocsSearchDoorsQuery(\n  $components: ID!\n  $standards: ID!\n) {\n  components: facetedInstances(classUri: $components, first: 0) {\n    totalCount\n  }\n  standards: facetedInstances(classUri: $standards, first: 0) {\n    totalCount\n  }\n}\n"
  }
};
})();

(node as any).hash = "1efd08e91235177b6efccc483785522e";

export default node;
