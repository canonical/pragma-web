/**
 * @generated SignedSource<<26703b7344e0accb9b0549af0b9f99ed>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type OntologyClassRow_node$data = {
  readonly __typename: "OntologyClass";
  readonly _meta: {
    readonly curie: string;
    readonly title: string;
  };
  readonly definition: string | null | undefined;
  readonly isAbstract: boolean;
  readonly " $fragmentType": "OntologyClassRow_node";
};
export type OntologyClassRow_node$key = {
  readonly " $data"?: OntologyClassRow_node$data;
  readonly " $fragmentSpreads": FragmentRefs<"OntologyClassRow_node">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "OntologyClassRow_node",
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
      "name": "isAbstract",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "definition",
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
  "type": "OntologyClass",
  "abstractKey": null
};

(node as any).hash = "82b6724669e277b61c7023e5d89de42f";

export default node;
