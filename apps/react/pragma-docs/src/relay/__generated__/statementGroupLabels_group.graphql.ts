/**
 * @generated SignedSource<<8ef9d0dd1c50da6f7435d46dc29ee1d2>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type statementGroupLabels_group$data = {
  readonly predicate: {
    readonly inverseLabel: string | null | undefined;
    readonly inversePluralLabel: string | null | undefined;
    readonly label: string | null | undefined;
    readonly pluralLabel: string | null | undefined;
  } | null | undefined;
  readonly predicateUri: string;
  readonly total: number;
  readonly " $fragmentType": "statementGroupLabels_group";
};
export type statementGroupLabels_group$key = {
  readonly " $data"?: statementGroupLabels_group$data;
  readonly " $fragmentSpreads": FragmentRefs<"statementGroupLabels_group">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "statementGroupLabels_group",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "predicateUri",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "total",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "OntologyProperty",
      "kind": "LinkedField",
      "name": "predicate",
      "plural": false,
      "selections": [
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
          "name": "pluralLabel",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "inverseLabel",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "inversePluralLabel",
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "type": "StatementGroup",
  "abstractKey": null
};

(node as any).hash = "64f89c1375cd77788eb7afcf782263ed";

export default node;
