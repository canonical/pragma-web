/**
 * @generated SignedSource<<67226eec889a04f061311255983661e8>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type DocsCardProjection_node$data = {
  readonly __typename: string;
  readonly CodeStandard: {
    readonly " $fragmentSpreads": FragmentRefs<"CodeStandardCard_node">;
  } | null | undefined;
  readonly Component: {
    readonly " $fragmentSpreads": FragmentRefs<"UIBlockCard_node">;
  } | null | undefined;
  readonly Layout: {
    readonly " $fragmentSpreads": FragmentRefs<"UIBlockCard_node">;
  } | null | undefined;
  readonly Modifier: {
    readonly " $fragmentSpreads": FragmentRefs<"ModifierCard_node">;
  } | null | undefined;
  readonly ModifierFamily: {
    readonly " $fragmentSpreads": FragmentRefs<"ModifierFamilyCard_node">;
  } | null | undefined;
  readonly Node: {
    readonly " $fragmentSpreads": FragmentRefs<"NodeCard_node">;
  };
  readonly OntologyClass: {
    readonly " $fragmentSpreads": FragmentRefs<"OntologyClassCard_node">;
  } | null | undefined;
  readonly Pattern: {
    readonly " $fragmentSpreads": FragmentRefs<"UIBlockCard_node">;
  } | null | undefined;
  readonly " $fragmentType": "DocsCardProjection_node";
};
export type DocsCardProjection_node$key = {
  readonly " $data"?: DocsCardProjection_node$data;
  readonly " $fragmentSpreads": FragmentRefs<"DocsCardProjection_node">;
};

const node: ReaderFragment = (function(){
var v0 = [
  {
    "args": null,
    "kind": "FragmentSpread",
    "name": "UIBlockCard_node"
  }
];
return {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "DocsCardProjection_node",
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
            "name": "OntologyClassCard_node"
          }
        ],
        "type": "OntologyClass",
        "abstractKey": null
      },
      "kind": "AliasedInlineFragmentSpread",
      "name": "OntologyClass"
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
            "name": "ModifierCard_node"
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
            "name": "ModifierFamilyCard_node"
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
            "name": "CodeStandardCard_node"
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

(node as any).hash = "c65b8244336d60b5b8110e619e1effd1";

export default node;
