/**
 * @generated SignedSource<<2fc819198337fec293e4420f6cbba4d6>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type SiteCommandSlot_node$data = {
  readonly __typename: string;
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

(node as any).hash = "25df470f7bbe29ea6f5c8895febf4bb8";

export default node;
