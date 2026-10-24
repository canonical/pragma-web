/**
 * @generated SignedSource<<2ddd1730055fd9e3764ad40b98f00813>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ComponentProperties_node$data = {
  readonly properties: ReadonlyArray<{
    readonly constraints: string | null | undefined;
    readonly defaultValue: string | null | undefined;
    readonly name: string | null | undefined;
    readonly optional: boolean | null | undefined;
    readonly propertyType: string | null | undefined;
    readonly summary: string | null | undefined;
  }>;
  readonly " $fragmentType": "ComponentProperties_node";
};
export type ComponentProperties_node$key = {
  readonly " $data"?: ComponentProperties_node$data;
  readonly " $fragmentSpreads": FragmentRefs<"ComponentProperties_node">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "ComponentProperties_node",
  "selections": [
    {
      "alias": null,
      "args": null,
      "concreteType": "Property",
      "kind": "LinkedField",
      "name": "properties",
      "plural": true,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "name",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "propertyType",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "optional",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "defaultValue",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "constraints",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "summary",
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "type": "Component",
  "abstractKey": null
};

(node as any).hash = "d65b4741f38b2475089e7aaed60d674f";

export default node;
