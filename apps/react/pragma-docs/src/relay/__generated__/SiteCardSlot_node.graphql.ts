/**
 * @generated SignedSource<<bb7000e3c4b49f4fdcd811a57e503992>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type SiteCardSlot_node$data = {
  readonly __typename: string;
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

(node as any).hash = "431620c5c7324393a1391db4e3eea096";

export default node;
