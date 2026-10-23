/**
 * @generated SignedSource<<03b389227e70670ebe771fa38d6fa268>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type OntologyClassCommand_node$data = {
  readonly __typename: "OntologyClass";
  readonly _meta: {
    readonly curie: string;
    readonly title: string;
  };
  readonly instanceCount: number;
  readonly isAbstract: boolean;
  readonly " $fragmentType": "OntologyClassCommand_node";
};
export type OntologyClassCommand_node$key = {
  readonly " $data"?: OntologyClassCommand_node$data;
  readonly " $fragmentSpreads": FragmentRefs<"OntologyClassCommand_node">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "OntologyClassCommand_node",
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
      "name": "instanceCount",
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

(node as any).hash = "84e4ba94604d99157e99482d0c5994d9";

export default node;
