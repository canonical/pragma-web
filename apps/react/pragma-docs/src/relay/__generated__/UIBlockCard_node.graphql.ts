/**
 * @generated SignedSource<<8702166c94a9edffeeb1a9c71ce0f451>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type UIBlockCard_node$data = {
  readonly __typename: string;
  readonly _meta: {
    readonly curie: string;
    readonly title: string;
    readonly type: {
      readonly _meta: {
        readonly title: string;
      };
    };
  };
  readonly documentationStages: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly _meta: {
          readonly title: string;
        };
      };
    }>;
  };
  readonly inheritsFroms: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly _meta: {
          readonly title: string;
        };
      };
    }>;
  };
  readonly summary: string | null | undefined;
  readonly tier: {
    readonly _meta: {
      readonly title: string;
    };
  } | null | undefined;
  readonly version: string | null | undefined;
  readonly " $fragmentType": "UIBlockCard_node";
};
export type UIBlockCard_node$key = {
  readonly " $data"?: UIBlockCard_node$data;
  readonly " $fragmentSpreads": FragmentRefs<"UIBlockCard_node">;
};

const node: ReaderFragment = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "title",
  "storageKey": null
},
v1 = [
  {
    "alias": null,
    "args": null,
    "concreteType": "EntityMeta",
    "kind": "LinkedField",
    "name": "_meta",
    "plural": false,
    "selections": [
      (v0/*:: as any*/)
    ],
    "storageKey": null
  }
],
v2 = [
  {
    "kind": "Literal",
    "name": "first",
    "value": 1
  }
];
return {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "UIBlockCard_node",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "__typename",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "version",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "summary",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "EntityMeta",
      "kind": "LinkedField",
      "name": "_meta",
      "plural": false,
      "selections": [
        (v0/*:: as any*/),
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "curie",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "concreteType": "OntologyClass",
          "kind": "LinkedField",
          "name": "type",
          "plural": false,
          "selections": (v1/*:: as any*/),
          "storageKey": null
        }
      ],
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "Tier",
      "kind": "LinkedField",
      "name": "tier",
      "plural": false,
      "selections": (v1/*:: as any*/),
      "storageKey": null
    },
    {
      "alias": null,
      "args": (v2/*:: as any*/),
      "concreteType": "UIBlockConnection",
      "kind": "LinkedField",
      "name": "inheritsFroms",
      "plural": false,
      "selections": [
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
      ],
      "storageKey": "inheritsFroms(first:1)"
    },
    {
      "alias": null,
      "args": (v2/*:: as any*/),
      "concreteType": "TagConnection",
      "kind": "LinkedField",
      "name": "documentationStages",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "concreteType": "TagEdge",
          "kind": "LinkedField",
          "name": "edges",
          "plural": true,
          "selections": [
            {
              "alias": null,
              "args": null,
              "concreteType": "Tag",
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
      "storageKey": "documentationStages(first:1)"
    }
  ],
  "type": "UIBlock",
  "abstractKey": "__isUIBlock"
};
})();

(node as any).hash = "1fc4f427f4634bb1b7cc042fe8bac9a3";

export default node;
