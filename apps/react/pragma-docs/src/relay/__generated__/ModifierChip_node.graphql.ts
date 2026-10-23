/**
 * @generated SignedSource<<c8e811e32f9bdfd5311e5341a2a9f5a6>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ModifierChip_node$data = {
  readonly __typename: "Modifier";
  readonly _meta: {
    readonly curie: string;
    readonly title: string;
    readonly type: {
      readonly _meta: {
        readonly title: string;
      };
    };
  };
  readonly " $fragmentType": "ModifierChip_node";
};
export type ModifierChip_node$key = {
  readonly " $data"?: ModifierChip_node$data;
  readonly " $fragmentSpreads": FragmentRefs<"ModifierChip_node">;
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
  "name": "ModifierChip_node",
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
    }
  ],
  "type": "Modifier",
  "abstractKey": null
};
})();

(node as any).hash = "b23ea0a0f90986fa165c02aaf76775d1";

export default node;
