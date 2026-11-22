/**
 * @generated SignedSource<<13534d508c5aec456e444f4f03c86620>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type SiteRowSlot_node$data = {
  readonly " $fragmentSpreads": FragmentRefs<"DocsRowProjection_node">;
  readonly " $fragmentType": "SiteRowSlot_node";
};
export type SiteRowSlot_node$key = {
  readonly " $data"?: SiteRowSlot_node$data;
  readonly " $fragmentSpreads": FragmentRefs<"SiteRowSlot_node">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "SiteRowSlot_node",
  "selections": [
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "DocsRowProjection_node"
    }
  ],
  "type": "Node",
  "abstractKey": "__isNode"
};

(node as any).hash = "c463e41b08901d195cdd045025eb3711";

export default node;
