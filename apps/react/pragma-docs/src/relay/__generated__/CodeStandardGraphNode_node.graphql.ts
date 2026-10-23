/**
 * @generated SignedSource<<f9953cc9b8d9b13cc6f6fe59e31a39a1>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type CodeStandardGraphNode_node$data = {
  readonly __typename: "CodeStandard";
  readonly _meta: {
    readonly curie: string;
    readonly type: {
      readonly _meta: {
        readonly title: string;
      };
    };
  };
  readonly " $fragmentType": "CodeStandardGraphNode_node";
};
export type CodeStandardGraphNode_node$key = {
  readonly " $data"?: CodeStandardGraphNode_node$data;
  readonly " $fragmentSpreads": FragmentRefs<"CodeStandardGraphNode_node">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "CodeStandardGraphNode_node",
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
  "type": "CodeStandard",
  "abstractKey": null
};

(node as any).hash = "529257b6bc1559592eab682c0835282d";

export default node;
