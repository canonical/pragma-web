/**
 * @generated SignedSource<<128f4156264fef340b6f42ab19b7e3e4>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ModifierFamilyRow_node$data = {
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
  readonly " $fragmentType": "ModifierFamilyRow_node";
};
export type ModifierFamilyRow_node$key = {
  readonly " $data"?: ModifierFamilyRow_node$data;
  readonly " $fragmentSpreads": FragmentRefs<"ModifierFamilyRow_node">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "ModifierFamilyRow_node",
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

(node as any).hash = "1932d3e8c11471e105db852a34d0235c";

export default node;
