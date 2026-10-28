/**
 * @generated SignedSource<<68fdc9cd18241d2e4b2d280287ad689b>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type GraphNodeProjection_node$data = {
  readonly __typename: string;
  readonly Node: {
    readonly " $fragmentSpreads": FragmentRefs<"NodeGraphNode_node">;
  };
  readonly OntologyClass: {
    readonly " $fragmentSpreads": FragmentRefs<"OntologyClassGraphNode_node">;
  } | null | undefined;
  readonly Site: {
    readonly " $fragmentSpreads": FragmentRefs<"SiteGraphNodeSlot_node">;
  };
  readonly " $fragmentType": "GraphNodeProjection_node";
};
export type GraphNodeProjection_node$key = {
  readonly " $data"?: GraphNodeProjection_node$data;
  readonly " $fragmentSpreads": FragmentRefs<"GraphNodeProjection_node">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "GraphNodeProjection_node",
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
            "name": "NodeGraphNode_node"
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
            "name": "SiteGraphNodeSlot_node"
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
            "name": "OntologyClassGraphNode_node"
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

(node as any).hash = "66f6ca7b49d239232aee18b21779920f";

export default node;
