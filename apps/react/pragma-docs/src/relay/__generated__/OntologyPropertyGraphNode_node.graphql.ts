/**
 * @generated SignedSource<<c40dd8d18e3d4a2fa4a89ff919522b96>>
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
  readonly namespace: string;
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

(node as any).hash = "557fcc9c8cedf63d610461e96bcc8c16";

export default node;
