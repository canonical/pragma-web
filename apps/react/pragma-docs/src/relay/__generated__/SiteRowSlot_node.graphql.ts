/**
 * @generated SignedSource<<706c645dc6a7569102ff15a672c836c4>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type SiteRowSlot_node$data = {
  readonly __typename: string;
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

(node as any).hash = "9e306eb1870a7c61abd0a9ccd0555900";

export default node;
