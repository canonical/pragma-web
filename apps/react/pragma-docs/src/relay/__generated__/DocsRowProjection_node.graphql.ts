/**
 * @generated SignedSource<<cb1b289ca03931ca56e2802d7cce4a92>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type DocsRowProjection_node$data = {
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
    readonly " $fragmentSpreads": FragmentRefs<"NodeRow_node">;
  };
  readonly OntologyClass: {
    readonly " $fragmentSpreads": FragmentRefs<"OntologyClassRow_node">;
  } | null | undefined;
  readonly Pattern: {
    readonly " $fragmentSpreads": FragmentRefs<"UIBlockRow_node">;
  } | null | undefined;
  readonly " $fragmentType": "DocsRowProjection_node";
};
export type DocsRowProjection_node$key = {
  readonly " $data"?: DocsRowProjection_node$data;
  readonly " $fragmentSpreads": FragmentRefs<"DocsRowProjection_node">;
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
  "name": "DocsRowProjection_node",
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
            "name": "OntologyClassRow_node"
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

(node as any).hash = "354c7bb82fd48de527a536503b5c9426";

export default node;
