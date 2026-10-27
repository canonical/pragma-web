/**
 * @generated SignedSource<<b13028e06ab59bead179246db10f8fb8>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type CommandProjection_node$data = {
  readonly __typename: string;
  readonly Node: {
    readonly " $fragmentSpreads": FragmentRefs<"NodeCommand_node">;
  };
  readonly OntologyClass: {
    readonly " $fragmentSpreads": FragmentRefs<"OntologyClassCommand_node">;
  } | null | undefined;
  readonly Site: {
    readonly " $fragmentSpreads": FragmentRefs<"SiteCommandSlot_node">;
  };
  readonly " $fragmentType": "CommandProjection_node";
};
export type CommandProjection_node$key = {
  readonly " $data"?: CommandProjection_node$data;
  readonly " $fragmentSpreads": FragmentRefs<"CommandProjection_node">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "CommandProjection_node",
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
            "name": "NodeCommand_node"
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
            "name": "SiteCommandSlot_node"
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
            "name": "OntologyClassCommand_node"
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

(node as any).hash = "db89f4e4e6190fa3bd117f1ac88bd707";

export default node;
