/**
 * @generated SignedSource<<695c346f032f18def001337acb37fe98>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type CardProjection_node$data = {
  readonly __typename: string;
  readonly Node: {
    readonly " $fragmentSpreads": FragmentRefs<"NodeCard_node">;
  };
  readonly OntologyClass: {
    readonly " $fragmentSpreads": FragmentRefs<"OntologyClassCard_node">;
  } | null | undefined;
  readonly Site: {
    readonly " $fragmentSpreads": FragmentRefs<"SiteCardSlot_node">;
  };
  readonly " $fragmentType": "CardProjection_node";
};
export type CardProjection_node$key = {
  readonly " $data"?: CardProjection_node$data;
  readonly " $fragmentSpreads": FragmentRefs<"CardProjection_node">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "CardProjection_node",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "__typename",
      "storageKey": null
    },
    {
      "fragment": {
        "kind": "InlineFragment",
        "selections": [
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "NodeCard_node"
          }
        ],
        "type": "Node",
        "abstractKey": "__isNode"
      },
      "kind": "AliasedInlineFragmentSpread",
      "name": "Node"
    },
    {
      "fragment": {
        "kind": "InlineFragment",
        "selections": [
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "SiteCardSlot_node"
          }
        ],
        "type": "Node",
        "abstractKey": "__isNode"
      },
      "kind": "AliasedInlineFragmentSpread",
      "name": "Site"
    },
    {
      "fragment": {
        "kind": "InlineFragment",
        "selections": [
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "OntologyClassCard_node"
          }
        ],
        "type": "OntologyClass",
        "abstractKey": null
      },
      "kind": "AliasedInlineFragmentSpread",
      "name": "OntologyClass"
    }
  ],
  "type": "Node",
  "abstractKey": "__isNode"
};

(node as any).hash = "48e4108b15100a85448aabe40b1aee26";

export default node;
