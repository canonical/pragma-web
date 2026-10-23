/**
 * @generated SignedSource<<4c214622a1e5b0a8e46a488dc4958274>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type OntologyPropertyChip_node$data = {
  readonly __typename: "OntologyProperty";
  readonly label: string | null | undefined;
  readonly uri: string;
  readonly " $fragmentType": "OntologyPropertyChip_node";
};
export type OntologyPropertyChip_node$key = {
  readonly " $data"?: OntologyPropertyChip_node$data;
  readonly " $fragmentSpreads": FragmentRefs<"OntologyPropertyChip_node">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "OntologyPropertyChip_node",
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

(node as any).hash = "8c483f18dc44f3022ce0e885ca650d55";

export default node;
