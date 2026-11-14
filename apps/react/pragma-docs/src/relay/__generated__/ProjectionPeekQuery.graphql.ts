/**
 * @generated SignedSource<<6d3538c669789c58f946db5ba25f8f1e>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ProjectionPeekQuery$variables = {
  id: string;
};
export type ProjectionPeekQuery$data = {
  readonly node: {
    readonly _meta: {
      readonly curie: string;
    };
    readonly " $fragmentSpreads": FragmentRefs<"CardProjection_node">;
  } | null | undefined;
};
export type ProjectionPeekQuery = {
  response: ProjectionPeekQuery$data;
  variables: ProjectionPeekQuery$variables;
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
  "name": "curie",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "title",
  "storageKey": null
},
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "definition",
  "storageKey": null
},
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "uri",
  "storageKey": null
},
v6 = [
  {
    "alias": null,
    "args": null,
    "concreteType": "EntityMeta",
    "kind": "LinkedField",
    "name": "_meta",
    "plural": false,
    "selections": [
      (v3/*:: as any*/)
    ],
    "storageKey": null
  },
  (v5/*:: as any*/)
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "ProjectionPeekQuery",
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
            "concreteType": "EntityMeta",
            "kind": "LinkedField",
            "name": "_meta",
            "plural": false,
            "selections": [
              (v2/*:: as any*/)
            ],
            "storageKey": null
          },
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "CardProjection_node"
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
    "name": "ProjectionPeekQuery",
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
            "alias": null,
            "args": null,
            "concreteType": "EntityMeta",
            "kind": "LinkedField",
            "name": "_meta",
            "plural": false,
            "selections": [
              (v2/*:: as any*/),
              (v3/*:: as any*/),
              (v4/*:: as any*/),
              {
                "alias": null,
                "args": null,
                "concreteType": "OntologyClass",
                "kind": "LinkedField",
                "name": "type",
                "plural": false,
                "selections": (v6/*:: as any*/),
                "storageKey": null
              }
            ],
            "storageKey": null
          },
          {
            "kind": "TypeDiscriminator",
            "abstractKey": "__isNode"
          },
          (v5/*:: as any*/),
          {
            "kind": "InlineFragment",
            "selections": [
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "isAbstract",
                "storageKey": null
              },
              (v4/*:: as any*/),
              {
                "alias": null,
                "args": null,
                "concreteType": "OntologyClass",
                "kind": "LinkedField",
                "name": "superclass",
                "plural": false,
                "selections": (v6/*:: as any*/),
                "storageKey": null
              }
            ],
            "type": "OntologyClass",
            "abstractKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "15e46433cdf9ff02396ca932fbea0f2c",
    "id": null,
    "metadata": {},
    "name": "ProjectionPeekQuery",
    "operationKind": "query",
    "text": "query ProjectionPeekQuery(\n  $id: ID!\n) {\n  node(id: $id) {\n    __typename\n    _meta {\n      curie\n    }\n    ...CardProjection_node\n    uri\n  }\n}\n\nfragment CardProjection_node on Node {\n  __isNode: __typename\n  __typename\n  ...NodeCard_node\n  ...SiteCardSlot_node\n  ...OntologyClassCard_node\n}\n\nfragment NodeCard_node on Node {\n  __isNode: __typename\n  __typename\n  _meta {\n    title\n    curie\n    definition\n    type {\n      _meta {\n        title\n      }\n      uri\n    }\n  }\n}\n\nfragment OntologyClassCard_node on OntologyClass {\n  __typename\n  isAbstract\n  definition\n  _meta {\n    title\n    curie\n  }\n  superclass {\n    _meta {\n      title\n    }\n    uri\n  }\n}\n\nfragment SiteCardSlot_node on Node {\n  __isNode: __typename\n  __typename\n}\n"
  }
};
})();

(node as any).hash = "a77e618dcf7d3e2cee34f95d215d28e2";

export default node;
