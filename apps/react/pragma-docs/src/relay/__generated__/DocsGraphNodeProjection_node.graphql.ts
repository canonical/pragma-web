/**
 * @generated SignedSource<<2ab1756c5667d8f2dccb75bc43f976f4>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type DocsGraphNodeProjection_node$data = {
  readonly __typename: string;
  readonly CodeStandard: {
    readonly " $fragmentSpreads": FragmentRefs<"CodeStandardGraphNode_node">;
  } | null | undefined;
  readonly Component: {
    readonly " $fragmentSpreads": FragmentRefs<"UIBlockGraphNode_node">;
  } | null | undefined;
  readonly Layout: {
    readonly " $fragmentSpreads": FragmentRefs<"UIBlockGraphNode_node">;
  } | null | undefined;
  readonly Modifier: {
    readonly " $fragmentSpreads": FragmentRefs<"ModifierGraphNode_node">;
  } | null | undefined;
  readonly ModifierFamily: {
    readonly " $fragmentSpreads": FragmentRefs<"ModifierFamilyGraphNode_node">;
  } | null | undefined;
  readonly Node: {
    readonly " $fragmentSpreads": FragmentRefs<"GraphNodeProjection_node">;
  };
  readonly Pattern: {
    readonly " $fragmentSpreads": FragmentRefs<"UIBlockGraphNode_node">;
  } | null | undefined;
  readonly " $fragmentType": "DocsGraphNodeProjection_node";
};
export type DocsGraphNodeProjection_node$key = {
  readonly " $data"?: DocsGraphNodeProjection_node$data;
  readonly " $fragmentSpreads": FragmentRefs<"DocsGraphNodeProjection_node">;
};

const node: ReaderFragment = (function(){
var v0 = [
  {
    "args": null,
    "kind": "FragmentSpread",
    "name": "UIBlockGraphNode_node"
  }
];
return {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "DocsGraphNodeProjection_node",
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
            "name": "GraphNodeProjection_node"
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
            "name": "ModifierGraphNode_node"
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
            "name": "ModifierFamilyGraphNode_node"
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
            "name": "CodeStandardGraphNode_node"
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

(node as any).hash = "4a6ee174c3dd005f3488132c74146aca";

export default node;
