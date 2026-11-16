/**
 * @generated SignedSource<<3f64e84360bd4598b7a139fa212196b5>>
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
    readonly title: string;
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
    }
  ],
  "type": "CodeStandard",
  "abstractKey": null
};

(node as any).hash = "10bf61f924fcc3ea006b9f597ab729fe";

export default node;
