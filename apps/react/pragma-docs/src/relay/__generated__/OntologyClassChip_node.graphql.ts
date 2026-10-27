/**
 * @generated SignedSource<<d980ac141208dfb3cfbdf773a08781fd>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type OntologyClassChip_node$data = {
  readonly __typename: "OntologyClass";
  readonly _meta: {
    readonly curie: string;
    readonly title: string;
  };
  readonly " $fragmentType": "OntologyClassChip_node";
};
export type OntologyClassChip_node$key = {
  readonly " $data"?: OntologyClassChip_node$data;
  readonly " $fragmentSpreads": FragmentRefs<"OntologyClassChip_node">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "OntologyClassChip_node",
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

(node as any).hash = "51bde66ffec70b4a7b27446564cc797f";

export default node;
