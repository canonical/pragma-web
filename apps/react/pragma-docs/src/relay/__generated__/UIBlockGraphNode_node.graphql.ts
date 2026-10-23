/**
 * @generated SignedSource<<e0338ee96b828406ea47ea13d4841bf6>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type UIBlockGraphNode_node$data = {
  readonly __typename: string;
  readonly _meta: {
    readonly curie: string;
    readonly type: {
      readonly _meta: {
        readonly title: string;
      };
    };
  };
  readonly tier: {
    readonly _meta: {
      readonly title: string;
    };
  } | null | undefined;
  readonly " $fragmentType": "UIBlockGraphNode_node";
};
export type UIBlockGraphNode_node$key = {
  readonly " $data"?: UIBlockGraphNode_node$data;
  readonly " $fragmentSpreads": FragmentRefs<"UIBlockGraphNode_node">;
};

const node: ReaderFragment = (function(){
var v0 = [
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
      }
    ],
    "storageKey": null
  }
];
return {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "UIBlockGraphNode_node",
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
          "selections": (v0/*:: as any*/),
          "storageKey": null
        }
      ],
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "Tier",
      "kind": "LinkedField",
      "name": "tier",
      "plural": false,
      "selections": (v0/*:: as any*/),
      "storageKey": null
    }
  ],
  "type": "UIBlock",
  "abstractKey": "__isUIBlock"
};
})();

(node as any).hash = "9abd6cf6808781e19254da7612a9c3d9";

export default node;
