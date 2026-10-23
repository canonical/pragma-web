/**
 * @generated SignedSource<<137221afe2285b9e93f327de7dfe9dcc>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type SiteCardProjection_node$data = {
  readonly __typename: string;
  readonly " $fragmentType": "SiteCardProjection_node";
};
export type SiteCardProjection_node$key = {
  readonly " $data"?: SiteCardProjection_node$data;
  readonly " $fragmentSpreads": FragmentRefs<"SiteCardProjection_node">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "SiteCardProjection_node",
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

(node as any).hash = "ac6a9c3ee28c3eb9cbe4cc35cf368a48";

export default node;
