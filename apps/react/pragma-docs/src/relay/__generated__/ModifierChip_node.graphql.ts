/**
 * @generated SignedSource<<817fbd2fa2d0902c9e7c6ebf49dd52b6>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ModifierChip_node$data = {
  readonly __typename: "Modifier";
  readonly _meta: {
    readonly curie: string;
    readonly title: string;
  };
  readonly uri: string;
  readonly " $fragmentType": "ModifierChip_node";
};
export type ModifierChip_node$key = {
  readonly " $data"?: ModifierChip_node$data;
  readonly " $fragmentSpreads": FragmentRefs<"ModifierChip_node">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "ModifierChip_node",
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
      "kind": "ScalarField",
      "name": "uri",
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
  "type": "Modifier",
  "abstractKey": null
};

(node as any).hash = "fc859573e31a0b282b281c96748591b3";

export default node;
