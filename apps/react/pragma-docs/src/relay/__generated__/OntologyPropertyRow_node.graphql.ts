/**
 * @generated SignedSource<<7d5c16ff6b923d6b6a8b6dd27110dd62>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type OntologyPropertyRow_node$data = {
  readonly __typename: "OntologyProperty";
  readonly definition: string | null | undefined;
  readonly label: string | null | undefined;
  readonly namespace: string;
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
      "name": "namespace",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "definition",
      "storageKey": null
    }
  ],
  "type": "OntologyProperty",
  "abstractKey": null
};

(node as any).hash = "90725f3bfc2921cdff5727221e54c9f7";

export default node;
