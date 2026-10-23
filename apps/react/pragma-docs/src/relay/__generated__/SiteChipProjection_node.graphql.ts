/**
 * @generated SignedSource<<9805336b8802711c78a5864f46dbd655>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type SiteChipProjection_node$data = {
  readonly __typename: string;
  readonly " $fragmentType": "SiteChipProjection_node";
};
export type SiteChipProjection_node$key = {
  readonly " $data"?: SiteChipProjection_node$data;
  readonly " $fragmentSpreads": FragmentRefs<"SiteChipProjection_node">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "SiteChipProjection_node",
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

(node as any).hash = "d3254ee392d838a6d797c2f3c6c6e413";

export default node;
