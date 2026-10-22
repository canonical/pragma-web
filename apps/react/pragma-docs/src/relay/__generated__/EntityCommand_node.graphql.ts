/**
 * @generated SignedSource<<d8c89652886a783fe3eee572bffc426b>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type EntityCommand_node$data = {
  readonly __typename: string;
  readonly _meta: {
    readonly curie: string;
  };
  readonly " $fragmentSpreads": FragmentRefs<"NodeCommand_node">;
  readonly " $fragmentType": "EntityCommand_node";
};
export type EntityCommand_node$key = {
  readonly " $data"?: EntityCommand_node$data;
  readonly " $fragmentSpreads": FragmentRefs<"EntityCommand_node">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "EntityCommand_node",
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
          "name": "curie",
          "storageKey": null
        }
      ],
      "storageKey": null
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "NodeCommand_node"
    }
  ],
  "type": "Node",
  "abstractKey": "__isNode"
};

(node as any).hash = "b7e2d23a7bbcd618d1583600e8ceab74";

export default node;
