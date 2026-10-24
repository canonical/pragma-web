/**
 * @generated SignedSource<<c48330c100bf2a18f8a98ac9e22c0ba3>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ComponentProbeQuery$variables = {
  uri: string;
};
export type ComponentProbeQuery$data = {
  readonly component: {
    readonly " $fragmentSpreads": FragmentRefs<"SiteCardProjection_node" | "SiteChipProjection_node" | "SiteCommandProjection_node" | "SiteGraphNodeProjection_node" | "SiteRowProjection_node">;
  } | null | undefined;
};
export type ComponentProbeQuery = {
  response: ComponentProbeQuery$data;
  variables: ComponentProbeQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "uri"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "uri",
    "variableName": "uri"
  }
],
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "uri",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "__typename",
  "storageKey": null
},
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "title",
  "storageKey": null
},
v5 = {
  "alias": null,
  "args": null,
  "concreteType": "EntityMeta",
  "kind": "LinkedField",
  "name": "_meta",
  "plural": false,
  "selections": [
    (v4/*:: as any*/)
  ],
  "storageKey": null
},
v6 = [
  (v5/*:: as any*/),
  (v2/*:: as any*/)
],
v7 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "definition",
  "storageKey": null
},
v8 = [
  {
    "kind": "Literal",
    "name": "first",
    "value": 1
  }
],
v9 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "version",
  "storageKey": null
},
v10 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "summary",
  "storageKey": null
},
v11 = [
  {
    "kind": "InlineFragment",
    "selections": [
      {
        "alias": null,
        "args": (v8/*:: as any*/),
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
                "selections": (v6/*:: as any*/),
                "storageKey": null
              }
            ],
            "storageKey": null
          }
        ],
        "storageKey": "documentationStages(first:1)"
      },
      (v9/*:: as any*/),
      {
        "alias": null,
        "args": null,
        "concreteType": "Tier",
        "kind": "LinkedField",
        "name": "tier",
        "plural": false,
        "selections": (v6/*:: as any*/),
        "storageKey": null
      },
      (v10/*:: as any*/),
      {
        "alias": null,
        "args": (v8/*:: as any*/),
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
                "selections": [
                  (v3/*:: as any*/),
                  (v5/*:: as any*/),
                  (v2/*:: as any*/)
                ],
                "storageKey": null
              }
            ],
            "storageKey": null
          }
        ],
        "storageKey": "inheritsFroms(first:1)"
      }
    ],
    "type": "UIBlock",
    "abstractKey": "__isUIBlock"
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "ComponentProbeQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*:: as any*/),
        "concreteType": "Component",
        "kind": "LinkedField",
        "name": "component",
        "plural": false,
        "selections": [
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "SiteChipProjection_node"
          },
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "SiteRowProjection_node"
          },
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "SiteCommandProjection_node"
          },
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "SiteGraphNodeProjection_node"
          },
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "SiteCardProjection_node"
          }
        ],
        "storageKey": null
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Operation",
    "name": "ComponentProbeQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*:: as any*/),
        "concreteType": "Component",
        "kind": "LinkedField",
        "name": "component",
        "plural": false,
        "selections": [
          (v2/*:: as any*/),
          {
            "kind": "InlineFragment",
            "selections": [
              (v3/*:: as any*/),
              {
                "alias": null,
                "args": null,
                "concreteType": "EntityMeta",
                "kind": "LinkedField",
                "name": "_meta",
                "plural": false,
                "selections": [
                  (v4/*:: as any*/),
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
                    "selections": (v6/*:: as any*/),
                    "storageKey": null
                  },
                  (v7/*:: as any*/)
                ],
                "storageKey": null
              },
              {
                "kind": "InlineFragment",
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "isAbstract",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "instanceCount",
                    "storageKey": null
                  },
                  (v7/*:: as any*/),
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "OntologyClass",
                    "kind": "LinkedField",
                    "name": "superclass",
                    "plural": false,
                    "selections": (v6/*:: as any*/),
                    "storageKey": null
                  }
                ],
                "type": "OntologyClass",
                "abstractKey": null
              },
              {
                "kind": "InlineFragment",
                "selections": (v11/*:: as any*/),
                "type": "Component",
                "abstractKey": null
              },
              {
                "kind": "InlineFragment",
                "selections": (v11/*:: as any*/),
                "type": "Pattern",
                "abstractKey": null
              },
              {
                "kind": "InlineFragment",
                "selections": (v11/*:: as any*/),
                "type": "Layout",
                "abstractKey": null
              },
              {
                "kind": "InlineFragment",
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "ModifierFamily",
                    "kind": "LinkedField",
                    "name": "modifierFamily",
                    "plural": false,
                    "selections": (v6/*:: as any*/),
                    "storageKey": null
                  },
                  (v9/*:: as any*/),
                  (v10/*:: as any*/)
                ],
                "type": "Modifier",
                "abstractKey": null
              },
              {
                "kind": "InlineFragment",
                "selections": [
                  {
                    "alias": null,
                    "args": [
                      {
                        "kind": "Literal",
                        "name": "first",
                        "value": 100
                      }
                    ],
                    "concreteType": "ModifierConnection",
                    "kind": "LinkedField",
                    "name": "modifiers",
                    "plural": false,
                    "selections": [
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "ModifierEdge",
                        "kind": "LinkedField",
                        "name": "edges",
                        "plural": true,
                        "selections": [
                          {
                            "alias": null,
                            "args": null,
                            "concreteType": "Modifier",
                            "kind": "LinkedField",
                            "name": "node",
                            "plural": false,
                            "selections": [
                              (v2/*:: as any*/)
                            ],
                            "storageKey": null
                          }
                        ],
                        "storageKey": null
                      }
                    ],
                    "storageKey": "modifiers(first:100)"
                  },
                  (v10/*:: as any*/)
                ],
                "type": "ModifierFamily",
                "abstractKey": null
              },
              {
                "kind": "InlineFragment",
                "selections": [
                  {
                    "alias": null,
                    "args": (v8/*:: as any*/),
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
                            "selections": (v6/*:: as any*/),
                            "storageKey": null
                          }
                        ],
                        "storageKey": null
                      }
                    ],
                    "storageKey": "categories(first:1)"
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "description",
                    "storageKey": null
                  }
                ],
                "type": "CodeStandard",
                "abstractKey": null
              }
            ],
            "type": "Node",
            "abstractKey": "__isNode"
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "1b92ef9816aff4092218c6ce2777e26d",
    "id": null,
    "metadata": {},
    "name": "ComponentProbeQuery",
    "operationKind": "query",
    "text": "query ComponentProbeQuery(\n  $uri: String!\n) {\n  component(uri: $uri) {\n    ...SiteChipProjection_node\n    ...SiteRowProjection_node\n    ...SiteCommandProjection_node\n    ...SiteGraphNodeProjection_node\n    ...SiteCardProjection_node\n    uri\n  }\n}\n\nfragment CardProjection_node on Node {\n  __isNode: __typename\n  __typename\n  ...NodeCard_node\n  ...OntologyClassCard_node\n}\n\nfragment ChipProjection_node on Node {\n  __isNode: __typename\n  __typename\n  ...NodeChip_node\n  ...OntologyClassChip_node\n}\n\nfragment CodeStandardCard_node on CodeStandard {\n  __typename\n  description\n  _meta {\n    title\n    curie\n    type {\n      _meta {\n        title\n      }\n      uri\n    }\n  }\n  categories(first: 1) {\n    edges {\n      node {\n        _meta {\n          title\n        }\n        uri\n      }\n    }\n  }\n}\n\nfragment CodeStandardChip_node on CodeStandard {\n  __typename\n  _meta {\n    title\n    curie\n  }\n}\n\nfragment CodeStandardCommand_node on CodeStandard {\n  __typename\n  _meta {\n    title\n    curie\n    type {\n      _meta {\n        title\n      }\n      uri\n    }\n  }\n  categories(first: 1) {\n    edges {\n      node {\n        _meta {\n          title\n        }\n        uri\n      }\n    }\n  }\n}\n\nfragment CodeStandardGraphNode_node on CodeStandard {\n  __typename\n  _meta {\n    title\n    curie\n    type {\n      _meta {\n        title\n      }\n      uri\n    }\n  }\n}\n\nfragment CodeStandardRow_node on CodeStandard {\n  __typename\n  _meta {\n    title\n    curie\n  }\n  categories(first: 1) {\n    edges {\n      node {\n        _meta {\n          title\n        }\n        uri\n      }\n    }\n  }\n}\n\nfragment CommandProjection_node on Node {\n  __isNode: __typename\n  __typename\n  ...NodeCommand_node\n  ...OntologyClassCommand_node\n}\n\nfragment GraphNodeProjection_node on Node {\n  __isNode: __typename\n  __typename\n  ...NodeGraphNode_node\n  ...OntologyClassGraphNode_node\n}\n\nfragment ModifierCard_node on Modifier {\n  __typename\n  version\n  summary\n  _meta {\n    title\n    curie\n    type {\n      _meta {\n        title\n      }\n      uri\n    }\n  }\n  modifierFamily {\n    _meta {\n      title\n    }\n    uri\n  }\n}\n\nfragment ModifierChip_node on Modifier {\n  __typename\n  _meta {\n    title\n    curie\n    type {\n      _meta {\n        title\n      }\n      uri\n    }\n  }\n}\n\nfragment ModifierCommand_node on Modifier {\n  __typename\n  _meta {\n    title\n    curie\n    type {\n      _meta {\n        title\n      }\n      uri\n    }\n  }\n  modifierFamily {\n    _meta {\n      title\n    }\n    uri\n  }\n}\n\nfragment ModifierFamilyCard_node on ModifierFamily {\n  __typename\n  summary\n  _meta {\n    title\n    curie\n    type {\n      _meta {\n        title\n      }\n      uri\n    }\n  }\n  modifiers(first: 100) {\n    edges {\n      node {\n        uri\n      }\n    }\n  }\n}\n\nfragment ModifierFamilyChip_node on ModifierFamily {\n  __typename\n  _meta {\n    title\n    curie\n  }\n  modifiers(first: 100) {\n    edges {\n      node {\n        uri\n      }\n    }\n  }\n}\n\nfragment ModifierFamilyCommand_node on ModifierFamily {\n  __typename\n  _meta {\n    title\n    curie\n    type {\n      _meta {\n        title\n      }\n      uri\n    }\n  }\n  modifiers(first: 100) {\n    edges {\n      node {\n        uri\n      }\n    }\n  }\n}\n\nfragment ModifierFamilyGraphNode_node on ModifierFamily {\n  __typename\n  _meta {\n    title\n    curie\n    type {\n      _meta {\n        title\n      }\n      uri\n    }\n  }\n}\n\nfragment ModifierFamilyRow_node on ModifierFamily {\n  __typename\n  _meta {\n    title\n    curie\n  }\n  modifiers(first: 100) {\n    edges {\n      node {\n        uri\n      }\n    }\n  }\n}\n\nfragment ModifierGraphNode_node on Modifier {\n  __typename\n  _meta {\n    title\n    curie\n    type {\n      _meta {\n        title\n      }\n      uri\n    }\n  }\n}\n\nfragment ModifierRow_node on Modifier {\n  __typename\n  _meta {\n    title\n    curie\n  }\n  modifierFamily {\n    _meta {\n      title\n    }\n    uri\n  }\n}\n\nfragment NodeCard_node on Node {\n  __isNode: __typename\n  __typename\n  _meta {\n    title\n    curie\n    definition\n    type {\n      _meta {\n        title\n      }\n      uri\n    }\n  }\n}\n\nfragment NodeChip_node on Node {\n  __isNode: __typename\n  __typename\n  _meta {\n    title\n    curie\n  }\n}\n\nfragment NodeCommand_node on Node {\n  __isNode: __typename\n  __typename\n  _meta {\n    title\n    curie\n    type {\n      _meta {\n        title\n      }\n      uri\n    }\n  }\n}\n\nfragment NodeGraphNode_node on Node {\n  __isNode: __typename\n  __typename\n  _meta {\n    curie\n    type {\n      _meta {\n        title\n      }\n      uri\n    }\n  }\n}\n\nfragment NodeRow_node on Node {\n  __isNode: __typename\n  __typename\n  _meta {\n    title\n    curie\n    type {\n      _meta {\n        title\n      }\n      uri\n    }\n  }\n}\n\nfragment OntologyClassCard_node on OntologyClass {\n  __typename\n  isAbstract\n  definition\n  _meta {\n    title\n    curie\n  }\n  superclass {\n    _meta {\n      title\n    }\n    uri\n  }\n}\n\nfragment OntologyClassChip_node on OntologyClass {\n  __typename\n  _meta {\n    title\n    curie\n  }\n}\n\nfragment OntologyClassCommand_node on OntologyClass {\n  __typename\n  isAbstract\n  instanceCount\n  _meta {\n    title\n    curie\n  }\n}\n\nfragment OntologyClassGraphNode_node on OntologyClass {\n  __typename\n  isAbstract\n  _meta {\n    curie\n  }\n}\n\nfragment OntologyClassRow_node on OntologyClass {\n  __typename\n  isAbstract\n  _meta {\n    title\n    curie\n  }\n}\n\nfragment RowProjection_node on Node {\n  __isNode: __typename\n  __typename\n  ...NodeRow_node\n  ...OntologyClassRow_node\n}\n\nfragment SiteCardProjection_node on Node {\n  __isNode: __typename\n  __typename\n  ...CardProjection_node\n  ... on Component {\n    ...UIBlockCard_node\n  }\n  ... on Pattern {\n    ...UIBlockCard_node\n  }\n  ... on Layout {\n    ...UIBlockCard_node\n  }\n  ...ModifierCard_node\n  ...ModifierFamilyCard_node\n  ...CodeStandardCard_node\n}\n\nfragment SiteChipProjection_node on Node {\n  __isNode: __typename\n  __typename\n  ...ChipProjection_node\n  ... on Component {\n    ...UIBlockChip_node\n  }\n  ... on Pattern {\n    ...UIBlockChip_node\n  }\n  ... on Layout {\n    ...UIBlockChip_node\n  }\n  ...ModifierChip_node\n  ...ModifierFamilyChip_node\n  ...CodeStandardChip_node\n}\n\nfragment SiteCommandProjection_node on Node {\n  __isNode: __typename\n  __typename\n  ...CommandProjection_node\n  ... on Component {\n    ...UIBlockCommand_node\n  }\n  ... on Pattern {\n    ...UIBlockCommand_node\n  }\n  ... on Layout {\n    ...UIBlockCommand_node\n  }\n  ...ModifierCommand_node\n  ...ModifierFamilyCommand_node\n  ...CodeStandardCommand_node\n}\n\nfragment SiteGraphNodeProjection_node on Node {\n  __isNode: __typename\n  __typename\n  ...GraphNodeProjection_node\n  ... on Component {\n    ...UIBlockGraphNode_node\n  }\n  ... on Pattern {\n    ...UIBlockGraphNode_node\n  }\n  ... on Layout {\n    ...UIBlockGraphNode_node\n  }\n  ...ModifierGraphNode_node\n  ...ModifierFamilyGraphNode_node\n  ...CodeStandardGraphNode_node\n}\n\nfragment SiteRowProjection_node on Node {\n  __isNode: __typename\n  __typename\n  ...RowProjection_node\n  ... on Component {\n    ...UIBlockRow_node\n  }\n  ... on Pattern {\n    ...UIBlockRow_node\n  }\n  ... on Layout {\n    ...UIBlockRow_node\n  }\n  ...ModifierRow_node\n  ...ModifierFamilyRow_node\n  ...CodeStandardRow_node\n}\n\nfragment UIBlockCard_node on UIBlock {\n  __isUIBlock: __typename\n  __typename\n  version\n  summary\n  _meta {\n    title\n    curie\n    type {\n      _meta {\n        title\n      }\n      uri\n    }\n  }\n  tier {\n    _meta {\n      title\n    }\n    uri\n  }\n  inheritsFroms(first: 1) {\n    edges {\n      node {\n        __typename\n        _meta {\n          title\n        }\n        uri\n      }\n    }\n  }\n  documentationStages(first: 1) {\n    edges {\n      node {\n        _meta {\n          title\n        }\n        uri\n      }\n    }\n  }\n}\n\nfragment UIBlockChip_node on UIBlock {\n  __isUIBlock: __typename\n  __typename\n  _meta {\n    title\n    curie\n  }\n}\n\nfragment UIBlockCommand_node on UIBlock {\n  __isUIBlock: __typename\n  __typename\n  version\n  _meta {\n    title\n    curie\n    type {\n      _meta {\n        title\n      }\n      uri\n    }\n  }\n  tier {\n    _meta {\n      title\n    }\n    uri\n  }\n  documentationStages(first: 1) {\n    edges {\n      node {\n        _meta {\n          title\n        }\n        uri\n      }\n    }\n  }\n}\n\nfragment UIBlockGraphNode_node on UIBlock {\n  __isUIBlock: __typename\n  __typename\n  _meta {\n    title\n    curie\n    type {\n      _meta {\n        title\n      }\n      uri\n    }\n  }\n  tier {\n    _meta {\n      title\n    }\n    uri\n  }\n}\n\nfragment UIBlockRow_node on UIBlock {\n  __isUIBlock: __typename\n  __typename\n  _meta {\n    title\n    curie\n  }\n  documentationStages(first: 1) {\n    edges {\n      node {\n        _meta {\n          title\n        }\n        uri\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "b99e204b60eb40da5c0704f167d0e5b0";

export default node;
