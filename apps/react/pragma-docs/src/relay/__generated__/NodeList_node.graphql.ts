/**
 * @generated SignedSource<<92b6a2a715bd326eda48f58911b4db41>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type NodeList_node$data = ReadonlyArray<{
  readonly uri: string;
  readonly " $fragmentSpreads": FragmentRefs<"CardProjection_node" | "RowProjection_node">;
  readonly " $fragmentType": "NodeList_node";
}>;
export type NodeList_node$key = ReadonlyArray<{
  readonly " $data"?: NodeList_node$data;
  readonly " $fragmentSpreads": FragmentRefs<"NodeList_node">;
}>;

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": {
    "plural": true
  },
  "name": "NodeList_node",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "uri",
      "storageKey": null
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "CardProjection_node"
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "RowProjection_node"
    }
  ],
  "type": "Node",
  "abstractKey": "__isNode"
};

(node as any).hash = "f07d406a5f20da6b7e1c500bba57ba1a";

export default node;
