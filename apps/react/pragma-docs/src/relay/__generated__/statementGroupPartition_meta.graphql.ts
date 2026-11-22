/**
 * @generated SignedSource<<3f01489b3a7a061e006ab3db73204b3f>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
export type TermVisibility = "HIDDEN" | "NORMAL" | "PROMINENT" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type statementGroupPartition_meta$data = {
  readonly definition: string | null | undefined;
  readonly fields: ReadonlyArray<{
    readonly group: {
      readonly label: string | null | undefined;
      readonly order: number | null | undefined;
      readonly uri: string;
    } | null | undefined;
    readonly name: string;
    readonly order: number | null | undefined;
    readonly property: {
      readonly uri: string;
    };
    readonly visibility: TermVisibility | null | undefined;
  }>;
  readonly " $fragmentType": "statementGroupPartition_meta";
};
export type statementGroupPartition_meta$key = {
  readonly " $data"?: statementGroupPartition_meta$data;
  readonly " $fragmentSpreads": FragmentRefs<"statementGroupPartition_meta">;
};

const node: ReaderFragment = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "order",
  "storageKey": null
},
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "uri",
  "storageKey": null
};
return {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "statementGroupPartition_meta",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "definition",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "ClassProperty",
      "kind": "LinkedField",
      "name": "fields",
      "plural": true,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "name",
          "storageKey": null
        },
        (v0/*:: as any*/),
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "visibility",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "concreteType": "PropertyGroup",
          "kind": "LinkedField",
          "name": "group",
          "plural": false,
          "selections": [
            (v1/*:: as any*/),
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "label",
              "storageKey": null
            },
            (v0/*:: as any*/)
          ],
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "concreteType": "OntologyProperty",
          "kind": "LinkedField",
          "name": "property",
          "plural": false,
          "selections": [
            (v1/*:: as any*/)
          ],
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "type": "EntityMeta",
  "abstractKey": null
};
})();

(node as any).hash = "9926f04ca22b4aac7c2104a2003d33b0";

export default node;
