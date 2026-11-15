/**
 * @generated SignedSource<<8cd332bf7b0b1198b011e2b862baa9a7>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ComponentChanges_node$data = {
  readonly changeLogs: ReadonlyArray<{
    readonly change: string | null | undefined;
    readonly changeType: string | null | undefined;
    readonly summary: string | null | undefined;
    readonly timestamp: string | null | undefined;
    readonly version: string | null | undefined;
  }>;
  readonly " $fragmentType": "ComponentChanges_node";
};
export type ComponentChanges_node$key = {
  readonly " $data"?: ComponentChanges_node$data;
  readonly " $fragmentSpreads": FragmentRefs<"ComponentChanges_node">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "ComponentChanges_node",
  "selections": [
    {
      "alias": null,
      "args": null,
      "concreteType": "ChangeLogEntry",
      "kind": "LinkedField",
      "name": "changeLogs",
      "plural": true,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "version",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "summary",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "change",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "changeType",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "timestamp",
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "type": "Component",
  "abstractKey": null
};

(node as any).hash = "c6cc84c16ff1f085e336ccbbf024615a";

export default node;
