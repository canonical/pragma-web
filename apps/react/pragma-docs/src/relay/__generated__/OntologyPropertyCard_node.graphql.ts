/**
 * @generated SignedSource<<e2157958b8b9d08d6ef2528cd3077674>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type OntologyPropertyCard_node$data = {
  readonly __typename: "OntologyProperty";
  readonly definition: string | null | undefined;
  readonly domain: {
    readonly _meta: {
      readonly title: string;
    };
  } | null | undefined;
  readonly functional: boolean;
  readonly inverse: {
    readonly label: string | null | undefined;
    readonly uri: string;
  } | null | undefined;
  readonly label: string | null | undefined;
  readonly range: string;
  readonly uri: string;
  readonly " $fragmentType": "OntologyPropertyCard_node";
};
export type OntologyPropertyCard_node$key = {
  readonly " $data"?: OntologyPropertyCard_node$data;
  readonly " $fragmentSpreads": FragmentRefs<"OntologyPropertyCard_node">;
};

const node: ReaderFragment = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "uri",
  "storageKey": null
},
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "label",
  "storageKey": null
};
return {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "OntologyPropertyCard_node",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "__typename",
      "storageKey": null
    },
    (v0/*:: as any*/),
    (v1/*:: as any*/),
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
      "kind": "ScalarField",
      "name": "range",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "functional",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "OntologyClass",
      "kind": "LinkedField",
      "name": "domain",
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
              "kind": "ScalarField",
              "name": "title",
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
      "args": null,
      "concreteType": "OntologyProperty",
      "kind": "LinkedField",
      "name": "inverse",
      "plural": false,
      "selections": [
        (v0/*:: as any*/),
        (v1/*:: as any*/)
      ],
      "storageKey": null
    }
  ],
  "type": "OntologyProperty",
  "abstractKey": null
};
})();

(node as any).hash = "8ca3299f6b1296315a70db9d6e10e802";

export default node;
