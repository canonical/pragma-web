/**
 * @generated SignedSource<<54aff77d4016e9eec205541b79bcb388>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type SiteGraphNodeSlot_node$data = {
  readonly __typename: string;
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

(node as any).hash = "653229988822315054d06505d1753ab0";

export default node;
