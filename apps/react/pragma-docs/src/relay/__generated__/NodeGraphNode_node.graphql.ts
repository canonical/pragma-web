/**
 * @generated SignedSource<<51c5c456b03cc84e8a4f80948a71938d>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type NodeGraphNode_node$data = {
  readonly __typename: string;
  readonly _meta: {
    readonly curie: string;
    readonly type: {
      readonly _meta: {
        readonly title: string;
      };
    };
  };
  readonly " $fragmentType": "NodeGraphNode_node";
};
export type NodeGraphNode_node$key = {
  readonly " $data"?: NodeGraphNode_node$data;
  readonly " $fragmentSpreads": FragmentRefs<"NodeGraphNode_node">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "NodeGraphNode_node",
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
                }
              ],
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

(node as any).hash = "d48e92d85c7749659562a0d6800cd5ee";

export default node;
