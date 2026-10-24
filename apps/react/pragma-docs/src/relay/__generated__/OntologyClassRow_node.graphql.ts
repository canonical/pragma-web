/**
 * @generated SignedSource<<89a4e04d014269960ae9eb98c891ef45>>
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

(node as any).hash = "13025b0a761a01ef25a765e87d6f5dcd";

export default node;
