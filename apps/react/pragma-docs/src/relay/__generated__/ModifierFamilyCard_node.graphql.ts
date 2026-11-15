/**
 * @generated SignedSource<<b79bdd2948e2a8de96252bcd8c90cef4>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ModifierFamilyCard_node$data = {
  readonly __typename: "ModifierFamily";
  readonly _meta: {
    readonly curie: string;
    readonly title: string;
  };
  readonly modifiers: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly uri: string;
      };
    }>;
  };
  readonly summary: string | null | undefined;
  readonly " $fragmentType": "ModifierFamilyCard_node";
};
export type ModifierFamilyCard_node$key = {
  readonly " $data"?: ModifierFamilyCard_node$data;
  readonly " $fragmentSpreads": FragmentRefs<"ModifierFamilyCard_node">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "ModifierFamilyCard_node",
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
      "name": "summary",
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
    },
    {
      "alias": null,
      "args": [
        {
          "kind": "Literal",
          "name": "first",
          "value": 100
        }
      ],
      "concreteType": "ModifierConnection",
      "kind": "LinkedField",
      "name": "modifiers",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "concreteType": "ModifierEdge",
          "kind": "LinkedField",
          "name": "edges",
          "plural": true,
          "selections": [
            {
              "alias": null,
              "args": null,
              "concreteType": "Modifier",
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
                }
              ],
              "storageKey": null
            }
          ],
          "storageKey": null
        }
      ],
      "storageKey": "modifiers(first:100)"
    }
  ],
  "type": "ModifierFamily",
  "abstractKey": null
};

(node as any).hash = "7d9348a0692a65e49d0c3911b0a15de1";

export default node;
