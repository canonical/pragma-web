/**
 * @generated SignedSource<<00c562d8050ae1e5d0e84c6790309c2f>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type UIBlockRow_node$data = {
  readonly __typename: string;
  readonly _meta: {
    readonly curie: string;
    readonly title: string;
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
  readonly summary: string | null | undefined;
  readonly " $fragmentType": "UIBlockRow_node";
};
export type UIBlockRow_node$key = {
  readonly " $data"?: UIBlockRow_node$data;
  readonly " $fragmentSpreads": FragmentRefs<"UIBlockRow_node">;
};

const node: ReaderFragment = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "title",
  "storageKey": null
};
return {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "UIBlockRow_node",
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
        }
      ],
      "storageKey": null
    },
    {
      "alias": null,
      "args": [
        {
          "kind": "Literal",
          "name": "first",
          "value": 1
        }
      ],
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
              "selections": [
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

(node as any).hash = "d34b01ba1e6640a97f365ef435d1205b";

export default node;
