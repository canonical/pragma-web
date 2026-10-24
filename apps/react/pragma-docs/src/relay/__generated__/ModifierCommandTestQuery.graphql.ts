/**
 * @generated SignedSource<<9f469ea33cb34bb2379023554a5fa9e8>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ModifierCommandTestQuery$variables = Record<PropertyKey, never>;
export type ModifierCommandTestQuery$data = {
  readonly node: {
    readonly ModifierCommand_node: {
      readonly " $fragmentSpreads": FragmentRefs<"ModifierCommand_node">;
    } | null | undefined;
  } | null | undefined;
};
export type ModifierCommandTestQuery = {
  response: ModifierCommandTestQuery$data;
  variables: ModifierCommandTestQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "kind": "Literal",
    "name": "id",
    "value": "test"
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
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "ModifierCommandTestQuery",
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
                  "name": "ModifierCommand_node"
                }
              ],
              "type": "Modifier",
              "abstractKey": null
            },
            "kind": "AliasedInlineFragmentSpread",
            "name": "ModifierCommand_node"
          }
        ],
        "storageKey": "node(id:\"test\")"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "ModifierCommandTestQuery",
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
        "storageKey": "node(id:\"test\")"
      }
    ]
  },
  "params": {
    "cacheID": "5f8221ecdbef82b7bd653ada1b10d1d2",
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
        "node.uri": (v6/*:: as any*/)
      }
    },
    "name": "ModifierCommandTestQuery",
    "operationKind": "query",
    "text": "query ModifierCommandTestQuery {\n  node(id: \"test\") {\n    __typename\n    ...ModifierCommand_node\n    uri\n  }\n}\n\nfragment ModifierCommand_node on Modifier {\n  __typename\n  _meta {\n    title\n    curie\n    type {\n      _meta {\n        title\n      }\n      uri\n    }\n  }\n  modifierFamily {\n    _meta {\n      title\n    }\n    uri\n  }\n}\n"
  }
};
})();

(node as any).hash = "9cb762009c419a4d8fbcd8a7b84cf91d";

export default node;
