/**
 * @generated SignedSource<<4068f9375383d133aa0ebd046b91ab1f>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type SiteCommandProjection_node$data = {
  readonly __typename: string;
  readonly " $fragmentType": "SiteCommandProjection_node";
};
export type SiteCommandProjection_node$key = {
  readonly " $data"?: SiteCommandProjection_node$data;
  readonly " $fragmentSpreads": FragmentRefs<"SiteCommandProjection_node">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "SiteCommandProjection_node",
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

(node as any).hash = "2f3888b4b5e731b77a28346ba4b7e271";

export default node;
