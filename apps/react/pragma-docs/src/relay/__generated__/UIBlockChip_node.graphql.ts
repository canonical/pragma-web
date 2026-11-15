/**
 * @generated SignedSource<<e056c62c26dc6c29011fc9f84c615fe9>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type UIBlockChip_node$data = {
  readonly __typename: string;
  readonly _meta: {
    readonly curie: string;
    readonly title: string;
  };
  readonly uri: string;
  readonly " $fragmentType": "UIBlockChip_node";
};
export type UIBlockChip_node$key = {
  readonly " $data"?: UIBlockChip_node$data;
  readonly " $fragmentSpreads": FragmentRefs<"UIBlockChip_node">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "UIBlockChip_node",
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
  "type": "UIBlock",
  "abstractKey": "__isUIBlock"
};

(node as any).hash = "39e790742835990e4cb34053d52a4954";

export default node;
