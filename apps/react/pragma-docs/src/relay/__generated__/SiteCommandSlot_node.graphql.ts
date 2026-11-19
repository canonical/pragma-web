/**
 * @generated SignedSource<<91a7e9b9136776c29650ba35b9fb635e>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type SiteCommandSlot_node$data = {
  readonly " $fragmentSpreads": FragmentRefs<"DocsCommandProjection_node">;
  readonly " $fragmentType": "SiteCommandSlot_node";
};
export type SiteCommandSlot_node$key = {
  readonly " $data"?: SiteCommandSlot_node$data;
  readonly " $fragmentSpreads": FragmentRefs<"SiteCommandSlot_node">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "SiteCommandSlot_node",
  "selections": [
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "DocsCommandProjection_node"
    }
  ],
  "type": "Node",
  "abstractKey": "__isNode"
};

(node as any).hash = "5485fe9ae4aab3f4e057a2e0dc260c01";

export default node;
