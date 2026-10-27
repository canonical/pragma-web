/**
 * @generated SignedSource<<72f8a1271d0a6083d61a6f0401458f9c>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type NodeChip_node$data = {
  readonly __typename: string;
  readonly _meta: {
    readonly curie: string;
    readonly title: string;
  };
  readonly " $fragmentType": "NodeChip_node";
};
export type NodeChip_node$key = {
  readonly " $data"?: NodeChip_node$data;
  readonly " $fragmentSpreads": FragmentRefs<"NodeChip_node">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "NodeChip_node",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "__typename",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "EntityMeta",
      "kind": "LinkedField",
      "name": "_meta",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "title",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "curie",
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "type": "Node",
  "abstractKey": "__isNode"
};

(node as any).hash = "29b7e8f85f98b4f0feed2fc9ec216da4";

export default node;
