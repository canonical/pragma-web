/**
 * @generated SignedSource<<c928a1a9dc39c340519a2a6767d9d5e6>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type SiteChipSlot_node$data = {
  readonly __typename: string;
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
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "__typename",
      "storageKey": null
    }
  ],
  "type": "Node",
  "abstractKey": "__isNode"
};

(node as any).hash = "8b9d20722211783595ab24ad699cb49c";

export default node;
