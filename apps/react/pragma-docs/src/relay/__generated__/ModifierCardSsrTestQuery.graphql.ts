/**
 * @generated SignedSource<<d2fb6f0ab6d8013006c9d6eb34acb802>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ModifierCardSsrTestQuery$variables = Record<PropertyKey, never>;
export type ModifierCardSsrTestQuery$data = {
  readonly node: {
    readonly ModifierCard_node: {
      readonly " $fragmentSpreads": FragmentRefs<"ModifierCard_node">;
    } | null | undefined;
  } | null | undefined;
};
export type ModifierCardSsrTestQuery = {
  response: ModifierCardSsrTestQuery$data;
  variables: ModifierCardSsrTestQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "kind": "Literal",
    "name": "id",
    "value": "ssr"
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
  "name": "title",
  "storageKey": null
},
v3 = [
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
  (v1/*:: as any*/)
],
v4 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "String"
},
v5 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "EntityMeta"
},
v6 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "ID"
},
v7 = {
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
    "name": "ModifierCardSsrTestQuery",
    "selections": [
      {
        "alias": null,
        "args": (v0/*:: as any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          {
            "fragment": {
              "kind": "InlineFragment",
              "selections": [
                {
                  "args": null,
                  "kind": "FragmentSpread",
                  "name": "ModifierCard_node"
                }
              ],
              "type": "Modifier",
              "abstractKey": null
            },
            "kind": "AliasedInlineFragmentSpread",
            "name": "ModifierCard_node"
          }
        ],
        "storageKey": "node(id:\"ssr\")"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "ModifierCardSsrTestQuery",
    "selections": [
      {
        "alias": null,
        "args": (v0/*:: as any*/),
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
          (v1/*:: as any*/),
          {
            "kind": "InlineFragment",
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
                "concreteType": "EntityMeta",
                "kind": "LinkedField",
                "name": "_meta",
                "plural": false,
                "selections": [
                  (v2/*:: as any*/),
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
                    "concreteType": "OntologyClass",
                    "kind": "LinkedField",
                    "name": "type",
                    "plural": false,
                    "selections": (v3/*:: as any*/),
                    "storageKey": null
                  }
                ],
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "concreteType": "ModifierFamily",
                "kind": "LinkedField",
                "name": "modifierFamily",
                "plural": false,
                "selections": (v3/*:: as any*/),
                "storageKey": null
              }
            ],
            "type": "Modifier",
            "abstractKey": null
          }
        ],
        "storageKey": "node(id:\"ssr\")"
      }
    ]
  },
  "params": {
    "cacheID": "894ba89daaa8d90bf8f25e5c6cbb9989",
    "id": null,
    "metadata": {
      "relayTestingSelectionTypeInfo": {
        "node": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "Node"
        },
        "node.__typename": (v4/*:: as any*/),
        "node._meta": (v5/*:: as any*/),
        "node._meta.curie": (v4/*:: as any*/),
        "node._meta.title": (v4/*:: as any*/),
        "node._meta.type": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "OntologyClass"
        },
        "node._meta.type._meta": (v5/*:: as any*/),
        "node._meta.type._meta.title": (v4/*:: as any*/),
        "node._meta.type.uri": (v6/*:: as any*/),
        "node.modifierFamily": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "ModifierFamily"
        },
        "node.modifierFamily._meta": (v5/*:: as any*/),
        "node.modifierFamily._meta.title": (v4/*:: as any*/),
        "node.modifierFamily.uri": (v6/*:: as any*/),
        "node.summary": (v7/*:: as any*/),
        "node.uri": (v6/*:: as any*/),
        "node.version": (v7/*:: as any*/)
      }
    },
    "name": "ModifierCardSsrTestQuery",
    "operationKind": "query",
    "text": "query ModifierCardSsrTestQuery {\n  node(id: \"ssr\") {\n    __typename\n    ...ModifierCard_node\n    uri\n  }\n}\n\nfragment ModifierCard_node on Modifier {\n  __typename\n  version\n  summary\n  _meta {\n    title\n    curie\n    type {\n      _meta {\n        title\n      }\n      uri\n    }\n  }\n  modifierFamily {\n    _meta {\n      title\n    }\n    uri\n  }\n}\n"
  }
};
})();

(node as any).hash = "15628d16cd90ab669586e33b74d0282a";

export default node;
