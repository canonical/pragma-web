/**
 * @generated SignedSource<<19c82cd85fa45c3cdd2b82b9cf895618>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type CodeStandardCard_node$data = {
  readonly __typename: "CodeStandard";
  readonly _meta: {
    readonly curie: string;
    readonly title: string;
  };
  readonly categories: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly _meta: {
          readonly title: string;
        };
      };
    }>;
  };
  readonly description: string | null | undefined;
  readonly " $fragmentType": "CodeStandardCard_node";
};
export type CodeStandardCard_node$key = {
  readonly " $data"?: CodeStandardCard_node$data;
  readonly " $fragmentSpreads": FragmentRefs<"CodeStandardCard_node">;
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
  "name": "CodeStandardCard_node",
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
      "name": "description",
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
      "concreteType": "CategoryConnection",
      "kind": "LinkedField",
      "name": "categories",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "concreteType": "CategoryEdge",
          "kind": "LinkedField",
          "name": "edges",
          "plural": true,
          "selections": [
            {
              "alias": null,
              "args": null,
              "concreteType": "Category",
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
      "storageKey": "categories(first:1)"
    }
  ],
  "type": "CodeStandard",
  "abstractKey": null
};
})();

(node as any).hash = "ee1b13302486abe713ad0b05ea401760";

export default node;
