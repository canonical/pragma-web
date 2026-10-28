/**
 * @generated SignedSource<<ac5dbadf28e8147c6e2a03fced33508e>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type RowProjection_node$data = {
  readonly __typename: string;
  readonly Node: {
    readonly " $fragmentSpreads": FragmentRefs<"NodeRow_node">;
  };
  readonly OntologyClass: {
    readonly " $fragmentSpreads": FragmentRefs<"OntologyClassRow_node">;
  } | null | undefined;
  readonly Site: {
    readonly " $fragmentSpreads": FragmentRefs<"SiteRowSlot_node">;
  };
  readonly " $fragmentType": "RowProjection_node";
};
export type RowProjection_node$key = {
  readonly " $data"?: RowProjection_node$data;
  readonly " $fragmentSpreads": FragmentRefs<"RowProjection_node">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RowProjection_node",
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
            "name": "NodeRow_node"
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
            "name": "SiteRowSlot_node"
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
            "name": "OntologyClassRow_node"
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

(node as any).hash = "7fc14671f5fe74455ee3651467848109";

export default node;
