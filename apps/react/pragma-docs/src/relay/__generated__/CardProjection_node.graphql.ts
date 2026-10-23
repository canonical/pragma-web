/**
 * @generated SignedSource<<993caecea1f86ba9a59e92a3c32a230b>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type CardProjection_node$data = {
  readonly __typename: string;
  readonly Node: {
    readonly " $fragmentSpreads": FragmentRefs<"NodeCard_node">;
  };
  readonly " $fragmentType": "CardProjection_node";
};
export type CardProjection_node$key = {
  readonly " $data"?: CardProjection_node$data;
  readonly " $fragmentSpreads": FragmentRefs<"CardProjection_node">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "CardProjection_node",
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
            "name": "NodeCard_node"
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

(node as any).hash = "0d1277307a16ec1da9bbc531e0b4077c";

export default node;
