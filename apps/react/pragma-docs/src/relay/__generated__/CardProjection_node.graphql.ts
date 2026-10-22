/**
 * @generated SignedSource<<f0230d84805f1b00842f0817a9a5db62>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type CardProjection_node$data = {
  readonly __typename: string;
  readonly _meta: {
    readonly curie: string;
  };
  readonly " $fragmentSpreads": FragmentRefs<"NodeCard_node">;
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
      "name": "NodeCard_node"
    }
  ],
  "type": "Node",
  "abstractKey": "__isNode"
};

(node as any).hash = "b4ee313abc430097ffb04279fd45d06f";

export default node;
