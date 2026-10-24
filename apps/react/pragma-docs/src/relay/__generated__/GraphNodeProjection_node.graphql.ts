/**
 * @generated SignedSource<<75fcfc45d7bb5051fae0e7048c1038db>>
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

(node as any).hash = "52522f219cfb561c752e3fe870950b19";

export default node;
