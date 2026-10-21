/**
 * @generated SignedSource<<855394bd23ac5bc53716f49364d46c68>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type NodeTitle_node$data = {
  readonly _meta: {
    readonly curie: string;
    readonly title: string;
    readonly type: {
      readonly uri: string;
    };
  };
  readonly " $fragmentType": "NodeTitle_node";
};
export type NodeTitle_node$key = {
  readonly " $data"?: NodeTitle_node$data;
  readonly " $fragmentSpreads": FragmentRefs<"NodeTitle_node">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "NodeTitle_node",
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

(node as any).hash = "afc5f6c5f238fcd17be21923bcf941a6";

export default node;
