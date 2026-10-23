/**
 * @generated SignedSource<<11ad5595a724082d24ea6bbb913cacd6>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type OntologyClassGraphNode_node$data = {
  readonly __typename: "OntologyClass";
  readonly _meta: {
    readonly curie: string;
  };
  readonly isAbstract: boolean;
  readonly " $fragmentType": "OntologyClassGraphNode_node";
};
export type OntologyClassGraphNode_node$key = {
  readonly " $data"?: OntologyClassGraphNode_node$data;
  readonly " $fragmentSpreads": FragmentRefs<"OntologyClassGraphNode_node">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "OntologyClassGraphNode_node",
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

(node as any).hash = "6667361463e1873dac2d0573b78796d8";

export default node;
