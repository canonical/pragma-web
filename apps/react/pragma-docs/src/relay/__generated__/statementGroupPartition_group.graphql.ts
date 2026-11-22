/**
 * @generated SignedSource<<64e08178a94bd7c201ae1672a1e75b8b>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
export type TermVisibility = "HIDDEN" | "NORMAL" | "PROMINENT" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type statementGroupPartition_group$data = {
  readonly predicateUri: string;
  readonly values: ReadonlyArray<{
    readonly __typename: "StatementLiteral";
    readonly lexical: string;
  } | {
    readonly __typename: "StatementNode";
    readonly node: {
      readonly _meta: {
        readonly type: {
          readonly visibility: TermVisibility | null | undefined;
        };
      };
    };
  } | {
    // This will never be '%other', but we need some
    // value in case none of the concrete values match.
    readonly __typename: "%other";
  }>;
  readonly " $fragmentType": "statementGroupPartition_group";
};
export type statementGroupPartition_group$key = {
  readonly " $data"?: statementGroupPartition_group$data;
  readonly " $fragmentSpreads": FragmentRefs<"statementGroupPartition_group">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "statementGroupPartition_group",
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
      "concreteType": null,
      "kind": "LinkedField",
      "name": "values",
      "plural": true,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "__typename",
          "storageKey": null
        },
        {
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
                  "concreteType": "EntityMeta",
                  "kind": "LinkedField",
                  "name": "_meta",
                  "plural": false,
                  "selections": [
                    {
                      "alias": null,
                      "args": null,
                      "concreteType": "OntologyClass",
                      "kind": "LinkedField",
                      "name": "type",
                      "plural": false,
                      "selections": [
                        {
                          "alias": null,
                          "args": null,
                          "kind": "ScalarField",
                          "name": "visibility",
                          "storageKey": null
                        }
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
          "type": "StatementNode",
          "abstractKey": null
        },
        {
          "kind": "InlineFragment",
          "selections": [
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "lexical",
              "storageKey": null
            }
          ],
          "type": "StatementLiteral",
          "abstractKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "type": "StatementGroup",
  "abstractKey": null
};

(node as any).hash = "02393d3b4e682a163763188ae84b7943";

export default node;
