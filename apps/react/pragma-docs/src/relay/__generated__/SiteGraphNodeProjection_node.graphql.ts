/**
 * @generated SignedSource<<0530c942815b105dfcbe29b37005ae7e>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type SiteGraphNodeProjection_node$data = {
  readonly __typename: string;
  readonly " $fragmentType": "SiteGraphNodeProjection_node";
};
export type SiteGraphNodeProjection_node$key = {
  readonly " $data"?: SiteGraphNodeProjection_node$data;
  readonly " $fragmentSpreads": FragmentRefs<"SiteGraphNodeProjection_node">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "SiteGraphNodeProjection_node",
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

(node as any).hash = "2a5611c737bad687c9239a420d416c51";

export default node;
