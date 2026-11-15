/**
 * @generated SignedSource<<1462d1ad7804c58ed0bd73aaeaac87eb>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ComponentTokens_node$data = {
  readonly tokenBindings: ReadonlyArray<{
    readonly consumesSymbol: string | null | undefined;
    readonly node: string | null | undefined;
    readonly rank: number | null | undefined;
  }>;
  readonly " $fragmentType": "ComponentTokens_node";
};
export type ComponentTokens_node$key = {
  readonly " $data"?: ComponentTokens_node$data;
  readonly " $fragmentSpreads": FragmentRefs<"ComponentTokens_node">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "ComponentTokens_node",
  "selections": [
    {
      "alias": null,
      "args": null,
      "concreteType": "TokenBinding",
      "kind": "LinkedField",
      "name": "tokenBindings",
      "plural": true,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "node",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "consumesSymbol",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "rank",
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "type": "Component",
  "abstractKey": null
};

(node as any).hash = "e691b839dec6cac623347cb8a3f0c594";

export default node;
