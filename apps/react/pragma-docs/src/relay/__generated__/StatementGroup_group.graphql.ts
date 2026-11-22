/**
 * @generated SignedSource<<f2389371aacf1bfd60337891d5afabc2>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type StatementGroup_group$data = {
  readonly total: number;
  readonly values: ReadonlyArray<{
    readonly __typename: "StatementForeign";
    readonly curie: string;
  } | {
    readonly __typename: "StatementLiteral";
    readonly lang: string | null | undefined;
    readonly lexical: string;
  } | {
    readonly __typename: "StatementNested";
    readonly groups: ReadonlyArray<{
      readonly predicate: {
        readonly label: string | null | undefined;
      } | null | undefined;
      readonly predicateUri: string;
      readonly values: ReadonlyArray<{
        readonly __typename: "StatementForeign";
        readonly curie: string;
      } | {
        readonly __typename: "StatementLiteral";
        readonly lang: string | null | undefined;
        readonly lexical: string;
      } | {
        readonly __typename: "StatementNested";
        readonly type: {
          readonly " $fragmentSpreads": FragmentRefs<"ChipProjection_node">;
        } | null | undefined;
      } | {
        readonly __typename: "StatementNode";
        readonly node: {
          readonly uri: string;
          readonly " $fragmentSpreads": FragmentRefs<"ChipProjection_node">;
        };
      } | {
        // This will never be '%other', but we need some
        // value in case none of the concrete values match.
        readonly __typename: "%other";
      }>;
    }>;
    readonly type: {
      readonly " $fragmentSpreads": FragmentRefs<"ChipProjection_node">;
    } | null | undefined;
  } | {
    readonly __typename: "StatementNode";
    readonly node: {
      readonly uri: string;
      readonly " $fragmentSpreads": FragmentRefs<"ChipProjection_node">;
    };
  } | {
    // This will never be '%other', but we need some
    // value in case none of the concrete values match.
    readonly __typename: "%other";
  }>;
  readonly " $fragmentType": "StatementGroup_group";
};
export type StatementGroup_group$key = {
  readonly " $data"?: StatementGroup_group$data;
  readonly " $fragmentSpreads": FragmentRefs<"StatementGroup_group">;
};

const node: ReaderFragment = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "__typename",
  "storageKey": null
},
v1 = {
  "args": null,
  "kind": "FragmentSpread",
  "name": "ChipProjection_node"
},
v2 = {
  "kind": "InlineFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "concreteType": null,
      "kind": "LinkedField",
      "name": "node",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "uri",
          "storageKey": null
        },
        (v1/*:: as any*/)
      ],
      "storageKey": null
    }
  ],
  "type": "StatementNode",
  "abstractKey": null
},
v3 = {
  "kind": "InlineFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "lexical",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "lang",
      "storageKey": null
    }
  ],
  "type": "StatementLiteral",
  "abstractKey": null
},
v4 = {
  "kind": "InlineFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "curie",
      "storageKey": null
    }
  ],
  "type": "StatementForeign",
  "abstractKey": null
},
v5 = {
  "alias": null,
  "args": null,
  "concreteType": "OntologyClass",
  "kind": "LinkedField",
  "name": "type",
  "plural": false,
  "selections": [
    (v1/*:: as any*/)
  ],
  "storageKey": null
};
return {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "StatementGroup_group",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "total",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": null,
      "kind": "LinkedField",
      "name": "values",
      "plural": true,
      "selections": [
        (v0/*:: as any*/),
        (v2/*:: as any*/),
        (v3/*:: as any*/),
        (v4/*:: as any*/),
        {
          "kind": "InlineFragment",
          "selections": [
            (v5/*:: as any*/),
            {
              "alias": null,
              "args": null,
              "concreteType": "StatementGroup",
              "kind": "LinkedField",
              "name": "groups",
              "plural": true,
              "selections": [
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "predicateUri",
                  "storageKey": null
                },
                {
                  "alias": null,
                  "args": null,
                  "concreteType": "OntologyProperty",
                  "kind": "LinkedField",
                  "name": "predicate",
                  "plural": false,
                  "selections": [
                    {
                      "alias": null,
                      "args": null,
                      "kind": "ScalarField",
                      "name": "label",
                      "storageKey": null
                    }
                  ],
                  "storageKey": null
                },
                {
                  "alias": null,
                  "args": null,
                  "concreteType": null,
                  "kind": "LinkedField",
                  "name": "values",
                  "plural": true,
                  "selections": [
                    (v0/*:: as any*/),
                    (v2/*:: as any*/),
                    (v3/*:: as any*/),
                    (v4/*:: as any*/),
                    {
                      "kind": "InlineFragment",
                      "selections": [
                        (v5/*:: as any*/)
                      ],
                      "type": "StatementNested",
                      "abstractKey": null
                    }
                  ],
                  "storageKey": null
                }
              ],
              "storageKey": null
            }
          ],
          "type": "StatementNested",
          "abstractKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "type": "StatementGroup",
  "abstractKey": null
};
})();

(node as any).hash = "6d2204b9ae359557ce8523382dd42bc2";

export default node;
