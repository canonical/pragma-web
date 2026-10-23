/**
 * @generated SignedSource<<df0a25b910618c676224489d138340b2>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
export type PropertyKind = "ANNOTATION" | "DATATYPE" | "OBJECT" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type OntologyPropertyCommand_node$data = {
  readonly __typename: "OntologyProperty";
  readonly domain: {
    readonly _meta: {
      readonly title: string;
    };
  } | null | undefined;
  readonly kind: PropertyKind;
  readonly label: string | null | undefined;
  readonly range: string;
  readonly uri: string;
  readonly " $fragmentType": "OntologyPropertyCommand_node";
};
export type OntologyPropertyCommand_node$key = {
  readonly " $data"?: OntologyPropertyCommand_node$data;
  readonly " $fragmentSpreads": FragmentRefs<"OntologyPropertyCommand_node">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "OntologyPropertyCommand_node",
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
      "kind": "ScalarField",
      "name": "range",
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

(node as any).hash = "249eaead50473b93947d612a13b8eeaf";

export default node;
