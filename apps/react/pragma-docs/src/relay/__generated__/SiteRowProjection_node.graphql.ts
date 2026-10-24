/**
 * @generated SignedSource<<ed950ca2ccc52234887ec694b79231e3>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type SiteRowProjection_node$data = {
  readonly __typename: string;
  readonly CodeStandard: {
    readonly " $fragmentSpreads": FragmentRefs<"CodeStandardRow_node">;
  } | null | undefined;
  readonly Component: {
    readonly " $fragmentSpreads": FragmentRefs<"UIBlockRow_node">;
  } | null | undefined;
  readonly Layout: {
    readonly " $fragmentSpreads": FragmentRefs<"UIBlockRow_node">;
  } | null | undefined;
  readonly Modifier: {
    readonly " $fragmentSpreads": FragmentRefs<"ModifierRow_node">;
  } | null | undefined;
  readonly ModifierFamily: {
    readonly " $fragmentSpreads": FragmentRefs<"ModifierFamilyRow_node">;
  } | null | undefined;
  readonly Node: {
    readonly " $fragmentSpreads": FragmentRefs<"RowProjection_node">;
  };
  readonly Pattern: {
    readonly " $fragmentSpreads": FragmentRefs<"UIBlockRow_node">;
  } | null | undefined;
  readonly " $fragmentType": "SiteRowProjection_node";
};
export type SiteRowProjection_node$key = {
  readonly " $data"?: SiteRowProjection_node$data;
  readonly " $fragmentSpreads": FragmentRefs<"SiteRowProjection_node">;
};

const node: ReaderFragment = (function(){
var v0 = [
  {
    "args": null,
    "kind": "FragmentSpread",
    "name": "UIBlockRow_node"
  }
];
return {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "SiteRowProjection_node",
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
            "name": "RowProjection_node"
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
            "name": "ModifierRow_node"
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
            "name": "ModifierFamilyRow_node"
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
            "name": "CodeStandardRow_node"
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

(node as any).hash = "db96b6d3266bb48b6e275b0761b6fb92";

export default node;
