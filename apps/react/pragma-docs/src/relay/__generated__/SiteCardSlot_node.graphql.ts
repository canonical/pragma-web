/**
 * @generated SignedSource<<c2f25f02a9de3394e5ec6f76704fb18f>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type SiteCardSlot_node$data = {
  readonly " $fragmentSpreads": FragmentRefs<"DocsCardProjection_node">;
  readonly " $fragmentType": "SiteCardSlot_node";
};
export type SiteCardSlot_node$key = {
  readonly " $data"?: SiteCardSlot_node$data;
  readonly " $fragmentSpreads": FragmentRefs<"SiteCardSlot_node">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "SiteCardSlot_node",
  "selections": [
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "DocsCardProjection_node"
    }
  ],
  "type": "Node",
  "abstractKey": "__isNode"
};

(node as any).hash = "c4f01bf62a307e11b1a00e1cf20f7735";

export default node;
