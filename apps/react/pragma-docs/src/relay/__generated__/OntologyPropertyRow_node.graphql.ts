/**
 * @generated SignedSource<<a830ef74a88da192d8954b3be92bfe27>>
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
      "name": "definition",
      "storageKey": null
    }
  ],
  "type": "OntologyProperty",
  "abstractKey": null
};

(node as any).hash = "60c1402c927a4eae79cc548cf2045cfd";

export default node;
