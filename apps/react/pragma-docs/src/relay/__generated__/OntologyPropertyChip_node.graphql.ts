/**
 * @generated SignedSource<<344462474ac2689788dab522b964e751>>
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
  readonly namespace: string;
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
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "namespace",
      "storageKey": null
    }
  ],
  "type": "OntologyProperty",
  "abstractKey": null
};

(node as any).hash = "6b883df0a5294139ca11f6aab5d382a1";

export default node;
