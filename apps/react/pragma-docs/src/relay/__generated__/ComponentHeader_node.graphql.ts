/**
 * @generated SignedSource<<04628a3b9cfc8ab56cbe45205d812f69>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ComponentHeader_node$data = {
  readonly _meta: {
    readonly curie: string;
  };
  readonly name: string | null | undefined;
  readonly summary: string | null | undefined;
  readonly " $fragmentType": "ComponentHeader_node";
};
export type ComponentHeader_node$key = {
  readonly " $data"?: ComponentHeader_node$data;
  readonly " $fragmentSpreads": FragmentRefs<"ComponentHeader_node">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "ComponentHeader_node",
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
      "name": "summary",
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
  "type": "Component",
  "abstractKey": null
};

(node as any).hash = "8fc6f1f1e1cf3d143255271b24add708";

export default node;
