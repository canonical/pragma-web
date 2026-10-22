/**
 * @generated SignedSource<<a047d1aa7ec98f85a9d6f3dfacdabd76>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type NodeChip_node$data = {
  readonly _meta: {
    readonly curie: string;
    readonly title: string;
    readonly type: {
      readonly uri: string;
    };
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
        },
        {
          "alias": null,
          "args": null,
          "concreteType": "OntologyClass",
          "kind": "LinkedField",
          "name": "type",
          "plural": false,
          "selections": [
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "uri",
              "storageKey": null
            }
          ],
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "type": "Node",
  "abstractKey": "__isNode"
};

(node as any).hash = "a8c1e2f4ec7125b7c65489aea3086c12";

export default node;
