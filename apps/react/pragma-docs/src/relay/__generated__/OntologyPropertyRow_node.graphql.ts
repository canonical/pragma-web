/**
 * @generated SignedSource<<7471f6a67a26728a54920c736e946c22>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
export type PropertyKind = "ANNOTATION" | "DATATYPE" | "OBJECT" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type OntologyPropertyRow_node$data = {
  readonly __typename: "OntologyProperty";
  readonly kind: PropertyKind;
  readonly label: string | null | undefined;
  readonly uri: string;
  readonly " $fragmentType": "OntologyPropertyRow_node";
};
export type OntologyPropertyRow_node$key = {
  readonly " $data"?: OntologyPropertyRow_node$data;
  readonly " $fragmentSpreads": FragmentRefs<"OntologyPropertyRow_node">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "OntologyPropertyRow_node",
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
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "kind",
      "storageKey": null
    }
  ],
  "type": "OntologyProperty",
  "abstractKey": null
};

(node as any).hash = "09b9811897a98f54062bc7b833001d4f";

export default node;
