/**
 * @generated SignedSource<<39d61372f4b619ebaf0e13ebaea3e665>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ChipProjection_node$data = {
  readonly __typename: string;
  readonly _meta: {
    readonly curie: string;
  };
  readonly " $fragmentSpreads": FragmentRefs<"NodeChip_node">;
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
      "name": "NodeChip_node"
    }
  ],
  "type": "Node",
  "abstractKey": "__isNode"
};

(node as any).hash = "cdd420dbf54a1f41c82204f08bd96d92";

export default node;
