/**
 * @generated SignedSource<<0644261fc060c7c78f1597380b90f111>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type SiteRowProjection_node$data = {
  readonly __typename: string;
  readonly " $fragmentType": "SiteRowProjection_node";
};
export type SiteRowProjection_node$key = {
  readonly " $data"?: SiteRowProjection_node$data;
  readonly " $fragmentSpreads": FragmentRefs<"SiteRowProjection_node">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "SiteRowProjection_node",
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

(node as any).hash = "9ae62f1753aca24059a45553906f8e59";

export default node;
