/**
 * @generated SignedSource<<e8b2ad374472d88971b8a9e0c310ea7c>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
export type PropertyKind = "ANNOTATION" | "DATATYPE" | "OBJECT" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type OntologyPropertyGraphNode_node$data = {
  readonly __typename: "OntologyProperty";
  readonly domain: {
    readonly _meta: {
      readonly title: string;
    };
  } | null | undefined;
  readonly kind: PropertyKind;
  readonly label: string | null | undefined;
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
      "name": "kind",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "OntologyClass",
      "kind": "LinkedField",
      "name": "domain",
      "plural": false,
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
              "name": "title",
              "storageKey": null
            }
          ],
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "type": "OntologyProperty",
  "abstractKey": null
};

(node as any).hash = "09e7505113afbb33d1b5d4a99217c980";

export default node;
