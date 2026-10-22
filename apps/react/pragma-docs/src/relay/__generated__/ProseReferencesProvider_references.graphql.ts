/**
 * @generated SignedSource<<7e9a22a27a831188c9496c86b2a6275e>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ProseReferencesProvider_references$data = {
  readonly edges: ReadonlyArray<{
    readonly node: {
      readonly _meta: {
        readonly curie: string;
      };
      readonly uri: string;
      readonly " $fragmentSpreads": FragmentRefs<"EntityChip_node">;
    };
  }>;
  readonly " $fragmentType": "ProseReferencesProvider_references";
};
export type ProseReferencesProvider_references$key = {
  readonly " $data"?: ProseReferencesProvider_references$data;
  readonly " $fragmentSpreads": FragmentRefs<"ProseReferencesProvider_references">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "ProseReferencesProvider_references",
  "selections": [
    {
      "alias": null,
      "args": null,
      "concreteType": "NodeEdge",
      "kind": "LinkedField",
      "name": "edges",
      "plural": true,
      "selections": [
        {
          "alias": null,
          "args": null,
          "concreteType": null,
          "kind": "LinkedField",
          "name": "node",
          "plural": false,
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
                  "kind": "ScalarField",
                  "name": "curie",
                  "storageKey": null
                }
              ],
              "storageKey": null
            },
            {
              "args": null,
              "kind": "FragmentSpread",
              "name": "EntityChip_node"
            }
          ],
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "type": "NodeConnection",
  "abstractKey": null
};

(node as any).hash = "1d1965509e1d9ec06a6d54fefcebc67d";

export default node;
