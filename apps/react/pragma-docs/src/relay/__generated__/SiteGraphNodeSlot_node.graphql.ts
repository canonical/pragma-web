/**
 * @generated SignedSource<<92cf642fc661bbd623e45cf645aef4b5>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type SiteGraphNodeSlot_node$data = {
  readonly " $fragmentSpreads": FragmentRefs<"DocsGraphNodeProjection_node">;
  readonly " $fragmentType": "SiteGraphNodeSlot_node";
};
export type SiteGraphNodeSlot_node$key = {
  readonly " $data"?: SiteGraphNodeSlot_node$data;
  readonly " $fragmentSpreads": FragmentRefs<"SiteGraphNodeSlot_node">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "SiteGraphNodeSlot_node",
  "selections": [
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "DocsGraphNodeProjection_node"
    }
  ],
  "type": "Node",
  "abstractKey": "__isNode"
};

(node as any).hash = "6eb06d20c7451df65a59f7d8e585b738";

export default node;
