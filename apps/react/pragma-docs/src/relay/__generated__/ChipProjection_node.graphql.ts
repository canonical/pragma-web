/**
 * @generated SignedSource<<f202fdf81e5ac185e0538ae12186091f>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ChipProjection_node$data = {
  readonly __typename: string;
  readonly Node: {
    readonly " $fragmentSpreads": FragmentRefs<"NodeChip_node">;
  };
  readonly " $fragmentType": "ChipProjection_node";
};
export type ChipProjection_node$key = {
  readonly " $data"?: ChipProjection_node$data;
  readonly " $fragmentSpreads": FragmentRefs<"ChipProjection_node">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "ChipProjection_node",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "__typename",
      "storageKey": null
    },
    {
      "fragment": {
        "kind": "InlineFragment",
        "selections": [
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "NodeChip_node"
          }
        ],
        "type": "Node",
        "abstractKey": "__isNode"
      },
      "kind": "AliasedInlineFragmentSpread",
      "name": "Node"
    }
  ],
  "type": "Node",
  "abstractKey": "__isNode"
};

(node as any).hash = "69bdb5a05f727063c83ea8f4bea72893";

export default node;
