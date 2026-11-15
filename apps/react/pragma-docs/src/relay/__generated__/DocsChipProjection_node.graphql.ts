/**
 * @generated SignedSource<<8697d2d8f34e7520464623da1e091be8>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type DocsChipProjection_node$data = {
  readonly __typename: string;
  readonly CodeStandard: {
    readonly " $fragmentSpreads": FragmentRefs<"CodeStandardChip_node">;
  } | null | undefined;
  readonly Component: {
    readonly " $fragmentSpreads": FragmentRefs<"UIBlockChip_node">;
  } | null | undefined;
  readonly Layout: {
    readonly " $fragmentSpreads": FragmentRefs<"UIBlockChip_node">;
  } | null | undefined;
  readonly Modifier: {
    readonly " $fragmentSpreads": FragmentRefs<"ModifierChip_node">;
  } | null | undefined;
  readonly ModifierFamily: {
    readonly " $fragmentSpreads": FragmentRefs<"ModifierFamilyChip_node">;
  } | null | undefined;
  readonly Node: {
    readonly " $fragmentSpreads": FragmentRefs<"ChipProjection_node">;
  };
  readonly Pattern: {
    readonly " $fragmentSpreads": FragmentRefs<"UIBlockChip_node">;
  } | null | undefined;
  readonly " $fragmentType": "DocsChipProjection_node";
};
export type DocsChipProjection_node$key = {
  readonly " $data"?: DocsChipProjection_node$data;
  readonly " $fragmentSpreads": FragmentRefs<"DocsChipProjection_node">;
};

const node: ReaderFragment = (function(){
var v0 = [
  {
    "args": null,
    "kind": "FragmentSpread",
    "name": "UIBlockChip_node"
  }
];
return {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "DocsChipProjection_node",
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
            "name": "ChipProjection_node"
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
        "selections": (v0/*:: as any*/),
        "type": "Component",
        "abstractKey": null
      },
      "kind": "AliasedInlineFragmentSpread",
      "name": "Component"
    },
    {
      "fragment": {
        "kind": "InlineFragment",
        "selections": (v0/*:: as any*/),
        "type": "Pattern",
        "abstractKey": null
      },
      "kind": "AliasedInlineFragmentSpread",
      "name": "Pattern"
    },
    {
      "fragment": {
        "kind": "InlineFragment",
        "selections": (v0/*:: as any*/),
        "type": "Layout",
        "abstractKey": null
      },
      "kind": "AliasedInlineFragmentSpread",
      "name": "Layout"
    },
    {
      "fragment": {
        "kind": "InlineFragment",
        "selections": [
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "ModifierChip_node"
          }
        ],
        "type": "Modifier",
        "abstractKey": null
      },
      "kind": "AliasedInlineFragmentSpread",
      "name": "Modifier"
    },
    {
      "fragment": {
        "kind": "InlineFragment",
        "selections": [
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "ModifierFamilyChip_node"
          }
        ],
        "type": "ModifierFamily",
        "abstractKey": null
      },
      "kind": "AliasedInlineFragmentSpread",
      "name": "ModifierFamily"
    },
    {
      "fragment": {
        "kind": "InlineFragment",
        "selections": [
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "CodeStandardChip_node"
          }
        ],
        "type": "CodeStandard",
        "abstractKey": null
      },
      "kind": "AliasedInlineFragmentSpread",
      "name": "CodeStandard"
    }
  ],
  "type": "Node",
  "abstractKey": "__isNode"
};
})();

(node as any).hash = "b33e54b83fcd3b7a52ea5bb558a367a2";

export default node;
