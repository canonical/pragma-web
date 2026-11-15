/**
 * @generated SignedSource<<c862e0af1f01999e0dcd0e20aab0f531>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type OntologyPropertyGraphNode_node$data = {
  readonly __typename: "OntologyProperty";
  readonly label: string | null | undefined;
  readonly uri: string;
  readonly " $fragmentType": "OntologyPropertyGraphNode_node";
};
export type OntologyPropertyGraphNode_node$key = {
  readonly " $data"?: OntologyPropertyGraphNode_node$data;
  readonly " $fragmentSpreads": FragmentRefs<"OntologyPropertyGraphNode_node">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "OntologyPropertyGraphNode_node",
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
      "name": "uri",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "label",
      "storageKey": null
    }
  ],
  "type": "OntologyProperty",
  "abstractKey": null
};

(node as any).hash = "8914d27317637765207daa5576c6a2bf";

export default node;
