/**
 * @generated SignedSource<<8d8f8a3e3b20ce4466540c853c0f60bc>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ComponentRelations_node$data = {
  readonly inheritsFroms: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly uri: string;
        readonly " $fragmentSpreads": FragmentRefs<"SiteRowProjection_node">;
      };
    }>;
  };
  readonly modifierFamilies: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly uri: string;
        readonly " $fragmentSpreads": FragmentRefs<"SiteRowProjection_node">;
      };
    }>;
  };
  readonly specializedBies: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly uri: string;
        readonly " $fragmentSpreads": FragmentRefs<"SiteRowProjection_node">;
      };
    }>;
  };
  readonly subcomponents: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly uri: string;
        readonly " $fragmentSpreads": FragmentRefs<"SiteRowProjection_node">;
      };
    }>;
  };
  readonly variantOfs: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly uri: string;
        readonly " $fragmentSpreads": FragmentRefs<"SiteRowProjection_node">;
      };
    }>;
  };
  readonly variants: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly uri: string;
        readonly " $fragmentSpreads": FragmentRefs<"SiteRowProjection_node">;
      };
    }>;
  };
  readonly " $fragmentType": "ComponentRelations_node";
};
export type ComponentRelations_node$key = {
  readonly " $data"?: ComponentRelations_node$data;
  readonly " $fragmentSpreads": FragmentRefs<"ComponentRelations_node">;
};

const node: ReaderFragment = (function(){
var v0 = [
  {
    "kind": "Variable",
    "name": "first",
    "variableName": "count"
  }
],
v1 = [
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "uri",
    "storageKey": null
  },
  {
    "args": null,
    "kind": "FragmentSpread",
    "name": "SiteRowProjection_node"
  }
],
v2 = [
  {
    "alias": null,
    "args": null,
    "concreteType": "UIBlockEdge",
    "kind": "LinkedField",
    "name": "edges",
    "plural": true,
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": (v1/*:: as any*/),
        "storageKey": null
      }
    ],
    "storageKey": null
  }
];
return {
  "argumentDefinitions": [
    {
      "defaultValue": null,
      "kind": "LocalArgument",
      "name": "count"
    }
  ],
  "kind": "Fragment",
  "metadata": null,
  "name": "ComponentRelations_node",
  "selections": [
    {
      "alias": null,
      "args": (v0/*:: as any*/),
      "concreteType": "UIBlockConnection",
      "kind": "LinkedField",
      "name": "inheritsFroms",
      "plural": false,
      "selections": (v2/*:: as any*/),
      "storageKey": null
    },
    {
      "alias": null,
      "args": (v0/*:: as any*/),
      "concreteType": "UIBlockConnection",
      "kind": "LinkedField",
      "name": "specializedBies",
      "plural": false,
      "selections": (v2/*:: as any*/),
      "storageKey": null
    },
    {
      "alias": null,
      "args": (v0/*:: as any*/),
      "concreteType": "UIBlockConnection",
      "kind": "LinkedField",
      "name": "variants",
      "plural": false,
      "selections": (v2/*:: as any*/),
      "storageKey": null
    },
    {
      "alias": null,
      "args": (v0/*:: as any*/),
      "concreteType": "UIBlockConnection",
      "kind": "LinkedField",
      "name": "variantOfs",
      "plural": false,
      "selections": (v2/*:: as any*/),
      "storageKey": null
    },
    {
      "alias": null,
      "args": (v0/*:: as any*/),
      "concreteType": "SubcomponentConnection",
      "kind": "LinkedField",
      "name": "subcomponents",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "concreteType": "SubcomponentEdge",
          "kind": "LinkedField",
          "name": "edges",
          "plural": true,
          "selections": [
            {
              "alias": null,
              "args": null,
              "concreteType": "Subcomponent",
              "kind": "LinkedField",
              "name": "node",
              "plural": false,
              "selections": (v1/*:: as any*/),
              "storageKey": null
            }
          ],
          "storageKey": null
        }
      ],
      "storageKey": null
    },
    {
      "alias": null,
      "args": (v0/*:: as any*/),
      "concreteType": "ModifierFamilyConnection",
      "kind": "LinkedField",
      "name": "modifierFamilies",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "concreteType": "ModifierFamilyEdge",
          "kind": "LinkedField",
          "name": "edges",
          "plural": true,
          "selections": [
            {
              "alias": null,
              "args": null,
              "concreteType": "ModifierFamily",
              "kind": "LinkedField",
              "name": "node",
              "plural": false,
              "selections": (v1/*:: as any*/),
              "storageKey": null
            }
          ],
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "type": "Component",
  "abstractKey": null
};
})();

(node as any).hash = "a98c19a6ddc8a0a209cd98e4a26d2927";

export default node;
