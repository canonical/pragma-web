/**
 * @generated SignedSource<<e310a730a04c20f60b1b50d61fdec06a>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
export type TermVisibility = "HIDDEN" | "NORMAL" | "PROMINENT" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type NodeList_node$data = ReadonlyArray<{
  readonly _meta: {
    readonly type: {
      readonly visibility: TermVisibility | null | undefined;
    };
  };
  readonly uri: string;
  readonly " $fragmentSpreads": FragmentRefs<"CardProjection_node" | "RowProjection_node">;
  readonly " $fragmentType": "NodeList_node";
}>;
export type NodeList_node$key = ReadonlyArray<{
  readonly " $data"?: NodeList_node$data;
  readonly " $fragmentSpreads": FragmentRefs<"NodeList_node">;
}>;

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": {
    "plural": true
  },
  "name": "NodeList_node",
  "selections": [
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
          "concreteType": "OntologyClass",
          "kind": "LinkedField",
          "name": "type",
          "plural": false,
          "selections": [
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "visibility",
              "storageKey": null
            }
          ],
          "storageKey": null
        }
      ],
      "storageKey": null
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "CardProjection_node"
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "RowProjection_node"
    }
  ],
  "type": "Node",
  "abstractKey": "__isNode"
};

(node as any).hash = "2e236db1df21f1ca29d22a0fbbda9755";

export default node;
