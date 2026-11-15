/**
 * @generated SignedSource<<8b1d2c4e36d15e882bf62a450162c365>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type UIBlockCommand_node$data = {
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
  readonly version: string | null | undefined;
  readonly " $fragmentType": "UIBlockCommand_node";
};
export type UIBlockCommand_node$key = {
  readonly " $data"?: UIBlockCommand_node$data;
  readonly " $fragmentSpreads": FragmentRefs<"UIBlockCommand_node">;
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
];
return {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "UIBlockCommand_node",
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

(node as any).hash = "7bbb80b663dd37d95592c93029e5249d";

export default node;
