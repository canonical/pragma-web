/**
 * @generated SignedSource<<2f4809e7498b1e8d98c5860acdea56e0>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type SiteChipSlot_node$data = {
  readonly " $fragmentSpreads": FragmentRefs<"DocsChipProjection_node">;
  readonly " $fragmentType": "SiteChipSlot_node";
};
export type SiteChipSlot_node$key = {
  readonly " $data"?: SiteChipSlot_node$data;
  readonly " $fragmentSpreads": FragmentRefs<"SiteChipSlot_node">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "SiteChipSlot_node",
  "selections": [
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "DocsChipProjection_node"
    }
  ],
  "type": "Node",
  "abstractKey": "__isNode"
};

(node as any).hash = "74ff7f87654d9adf53acee32d426e8d3";

export default node;
