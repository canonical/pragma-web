/**
 * @generated SignedSource<<8fd657d82b4520d2ad1dedc4f3edfeff>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ComponentAnatomy_node$data = {
  readonly _meta: {
    readonly curie: string;
  };
  readonly anatomyDsl: string | null | undefined;
  readonly name: string | null | undefined;
  readonly " $fragmentType": "ComponentAnatomy_node";
};
export type ComponentAnatomy_node$key = {
  readonly " $data"?: ComponentAnatomy_node$data;
  readonly " $fragmentSpreads": FragmentRefs<"ComponentAnatomy_node">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "ComponentAnatomy_node",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "name",
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
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "anatomyDsl",
      "storageKey": null
    }
  ],
  "type": "Component",
  "abstractKey": null
};

(node as any).hash = "8555d604689b47c1c41325291d1b2c14";

export default node;
