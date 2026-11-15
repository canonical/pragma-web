/**
 * @generated SignedSource<<013268a5990c8c65e90c5cdc6edc9b3f>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ModifierFamilyChip_node$data = {
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
  readonly uri: string;
  readonly " $fragmentType": "ModifierFamilyChip_node";
};
export type ModifierFamilyChip_node$key = {
  readonly " $data"?: ModifierFamilyChip_node$data;
  readonly " $fragmentSpreads": FragmentRefs<"ModifierFamilyChip_node">;
};

const node: ReaderFragment = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "uri",
  "storageKey": null
};
return {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "ModifierFamilyChip_node",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "__typename",
      "storageKey": null
    },
    (v0/*:: as any*/),
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
                (v0/*:: as any*/)
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
})();

(node as any).hash = "4b82f3322096e1c133c381ead83b9e3f";

export default node;
