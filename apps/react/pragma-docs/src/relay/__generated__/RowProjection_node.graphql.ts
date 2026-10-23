/**
 * @generated SignedSource<<b84cdfbc997081f3b101d7aeac95f839>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type RowProjection_node$data = {
  readonly __typename: string;
  readonly Node: {
    readonly " $fragmentSpreads": FragmentRefs<"NodeRow_node">;
  };
  readonly " $fragmentType": "RowProjection_node";
};
export type RowProjection_node$key = {
  readonly " $data"?: RowProjection_node$data;
  readonly " $fragmentSpreads": FragmentRefs<"RowProjection_node">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RowProjection_node",
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
            "name": "NodeRow_node"
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

(node as any).hash = "5ead030feb671d8183ebde79dd675303";

export default node;
