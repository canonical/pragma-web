/**
 * @generated SignedSource<<c18547b11c5d8d7ac17742d087e208b2>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type CodeStandardChip_node$data = {
  readonly __typename: "CodeStandard";
  readonly _meta: {
    readonly curie: string;
    readonly title: string;
  };
  readonly " $fragmentType": "CodeStandardChip_node";
};
export type CodeStandardChip_node$key = {
  readonly " $data"?: CodeStandardChip_node$data;
  readonly " $fragmentSpreads": FragmentRefs<"CodeStandardChip_node">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "CodeStandardChip_node",
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
  "type": "CodeStandard",
  "abstractKey": null
};

(node as any).hash = "b7e358c4cf42ae7657aeb6ef13a55d30";

export default node;
