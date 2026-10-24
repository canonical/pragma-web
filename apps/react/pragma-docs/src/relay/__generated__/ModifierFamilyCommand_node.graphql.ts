/**
 * @generated SignedSource<<f077957e68ebc8856035b1257af29ed1>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ModifierFamilyCommand_node$data = {
  readonly __typename: "ModifierFamily";
  readonly _meta: {
    readonly curie: string;
    readonly title: string;
    readonly type: {
      readonly _meta: {
        readonly title: string;
      };
    };
  };
  readonly modifiers: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly uri: string;
      };
    }>;
  };
  readonly " $fragmentType": "ModifierFamilyCommand_node";
};
export type ModifierFamilyCommand_node$key = {
  readonly " $data"?: ModifierFamilyCommand_node$data;
  readonly " $fragmentSpreads": FragmentRefs<"ModifierFamilyCommand_node">;
};

const node: ReaderFragment = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "title",
  "storageKey": null
};
return {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "ModifierFamilyCommand_node",
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
        (v0/*:: as any*/),
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
                (v0/*:: as any*/)
              ],
              "storageKey": null
            }
          ],
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
})();

(node as any).hash = "6466f44a4434b0a4a3b1bf393fe85aa6";

export default node;
