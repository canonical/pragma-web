/**
 * @generated SignedSource<<5017b5c5d5c10c8766db38faa4961ca2>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type EntityRow_node$data = {
  readonly __typename: string;
  readonly _meta: {
    readonly curie: string;
  };
  readonly " $fragmentSpreads": FragmentRefs<"NodeRow_node">;
  readonly " $fragmentType": "EntityRow_node";
};
export type EntityRow_node$key = {
  readonly " $data"?: EntityRow_node$data;
  readonly " $fragmentSpreads": FragmentRefs<"EntityRow_node">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "EntityRow_node",
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
      "name": "NodeRow_node"
    }
  ],
  "type": "Node",
  "abstractKey": "__isNode"
};

(node as any).hash = "2053cd3bfc789f5d5050943d240b96b3";

export default node;
