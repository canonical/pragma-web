/**
 * @generated SignedSource<<0835e734c9f4584e8fcd3b36a136802e>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type CommandProjection_node$data = {
  readonly __typename: string;
  readonly Node: {
    readonly " $fragmentSpreads": FragmentRefs<"NodeCommand_node">;
  };
  readonly " $fragmentType": "CommandProjection_node";
};
export type CommandProjection_node$key = {
  readonly " $data"?: CommandProjection_node$data;
  readonly " $fragmentSpreads": FragmentRefs<"CommandProjection_node">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "CommandProjection_node",
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
            "name": "NodeCommand_node"
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

(node as any).hash = "17acb2674e9fcdff2d9ea9478ca0cd90";

export default node;
