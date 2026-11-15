/**
 * @generated SignedSource<<8f7c01f4ddfb48a11a2a4d94760927a4>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ModifierRow_node$data = {
  readonly __typename: "Modifier";
  readonly _meta: {
    readonly curie: string;
    readonly title: string;
  };
  readonly modifierFamily: {
    readonly _meta: {
      readonly title: string;
    };
  } | null | undefined;
  readonly summary: string | null | undefined;
  readonly " $fragmentType": "ModifierRow_node";
};
export type ModifierRow_node$key = {
  readonly " $data"?: ModifierRow_node$data;
  readonly " $fragmentSpreads": FragmentRefs<"ModifierRow_node">;
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
  "name": "ModifierRow_node",
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
        (v0/*:: as any*/),
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
      "args": null,
      "concreteType": "ModifierFamily",
      "kind": "LinkedField",
      "name": "modifierFamily",
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
  "type": "Modifier",
  "abstractKey": null
};
})();

(node as any).hash = "5016e09dee58070548723323b522451c";

export default node;
