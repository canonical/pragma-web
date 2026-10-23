/**
 * @generated SignedSource<<38db5f9ff1528e9afc3b3344cda3e207>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ModifierGraphNode_node$data = {
  readonly __typename: "Modifier";
  readonly _meta: {
    readonly curie: string;
    readonly type: {
      readonly _meta: {
        readonly title: string;
      };
    };
  };
  readonly " $fragmentType": "ModifierGraphNode_node";
};
export type ModifierGraphNode_node$key = {
  readonly " $data"?: ModifierGraphNode_node$data;
  readonly " $fragmentSpreads": FragmentRefs<"ModifierGraphNode_node">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "ModifierGraphNode_node",
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
  "type": "Modifier",
  "abstractKey": null
};

(node as any).hash = "90e2254a38d7891c1f55f50e37edff61";

export default node;
