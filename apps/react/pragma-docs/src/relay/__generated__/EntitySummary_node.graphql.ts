/**
 * @generated SignedSource<<769d43099c9acc7ffc9a04af8ab09c82>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type EntitySummary_node$data = {
  readonly _meta: {
    readonly comment: string | null | undefined;
    readonly definition: string | null | undefined;
    readonly type: {
      readonly " $fragmentSpreads": FragmentRefs<"ChipProjection_node">;
    };
  };
  readonly " $fragmentType": "EntitySummary_node";
};
export type EntitySummary_node$key = {
  readonly " $data"?: EntitySummary_node$data;
  readonly " $fragmentSpreads": FragmentRefs<"EntitySummary_node">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "EntitySummary_node",
  "selections": [
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
          "name": "definition",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "comment",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "concreteType": "OntologyClass",
          "kind": "LinkedField",
          "name": "type",
          "plural": false,
          "selections": [
            {
              "args": null,
              "kind": "FragmentSpread",
              "name": "ChipProjection_node"
            }
          ],
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "type": "Node",
  "abstractKey": "__isNode"
};

(node as any).hash = "3632b5d454d0a624735a03f076ec9e35";

export default node;
