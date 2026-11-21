/**
 * @generated SignedSource<<82a530bd27b4e83835ea0f76c05300d2>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
export type TermVisibility = "HIDDEN" | "NORMAL" | "PROMINENT" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type NodeList_node$data = ReadonlyArray<{
  readonly __typename: string;
  readonly _meta: {
    readonly curie: string;
    readonly title: string;
    readonly type: {
      readonly superclasses: ReadonlyArray<{
        readonly uri: string;
      }>;
      readonly uri: string;
      readonly visibility: TermVisibility | null | undefined;
    };
  };
  readonly uri: string;
  readonly values: ReadonlyArray<{
    readonly field: string;
    readonly label: string;
    readonly text: string | null | undefined;
    readonly type: string;
  }>;
  readonly " $fragmentSpreads": FragmentRefs<"CardProjection_node" | "RowProjection_node">;
  readonly " $fragmentType": "NodeList_node";
}>;
export type NodeList_node$key = ReadonlyArray<{
  readonly " $data"?: NodeList_node$data;
  readonly " $fragmentSpreads": FragmentRefs<"NodeList_node">;
}>;

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
  "metadata": {
    "plural": true
  },
  "name": "NodeList_node",
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
        },
        {
          "alias": null,
          "args": null,
          "concreteType": "OntologyClass",
          "kind": "LinkedField",
          "name": "type",
          "plural": false,
          "selections": [
            (v0/*:: as any*/),
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "visibility",
              "storageKey": null
            },
            {
              "alias": null,
              "args": null,
              "concreteType": "OntologyClass",
              "kind": "LinkedField",
              "name": "superclasses",
              "plural": true,
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
      "args": null,
      "concreteType": "NodeValue",
      "kind": "LinkedField",
      "name": "values",
      "plural": true,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "field",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "label",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "text",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "type",
          "storageKey": null
        }
      ],
      "storageKey": null
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "CardProjection_node"
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "RowProjection_node"
    }
  ],
  "type": "Node",
  "abstractKey": "__isNode"
};
})();

(node as any).hash = "2f51970cc214c0c966630705f53c5d91";

export default node;
