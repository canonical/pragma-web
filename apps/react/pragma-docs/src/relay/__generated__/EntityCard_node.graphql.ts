/**
 * @generated SignedSource<<3b33b2e2c0cf2d2f0dbb976cbffbc826>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type EntityCard_node$data = {
  readonly __typename: string;
  readonly _meta: {
    readonly curie: string;
  };
  readonly " $fragmentSpreads": FragmentRefs<"NodeCard_node">;
  readonly " $fragmentType": "EntityCard_node";
};
export type EntityCard_node$key = {
  readonly " $data"?: EntityCard_node$data;
  readonly " $fragmentSpreads": FragmentRefs<"EntityCard_node">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "EntityCard_node",
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
        }
      ],
      "storageKey": null
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "NodeCard_node"
    }
  ],
  "type": "Node",
  "abstractKey": "__isNode"
};

(node as any).hash = "718a7c258eb6bb1a3ac533aa9f5875b2";

export default node;
