/**
 * @generated SignedSource<<dea94100c4aba46be9a09d2d024779c2>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type LobbyQuery$variables = {
  componentClass: string;
  exemplars: number;
  patternClass: string;
  standardClass: string;
};
export type LobbyQuery$data = {
  readonly componentClass: {
    readonly instanceCount: number;
    readonly instances: {
      readonly edges: ReadonlyArray<{
        readonly node: {
          readonly uri: string;
          readonly " $fragmentSpreads": FragmentRefs<"SiteChipProjection_node">;
        };
      }>;
    };
  } | null | undefined;
  readonly patternClass: {
    readonly instanceCount: number;
  } | null | undefined;
  readonly standardClass: {
    readonly instanceCount: number;
  } | null | undefined;
};
export type LobbyQuery = {
  response: LobbyQuery$data;
  variables: LobbyQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "componentClass"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "exemplars"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "patternClass"
},
v3 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "standardClass"
},
v4 = [
  {
    "kind": "Variable",
    "name": "uri",
    "variableName": "componentClass"
  }
],
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "instanceCount",
  "storageKey": null
},
v6 = [
  {
    "kind": "Variable",
    "name": "first",
    "variableName": "exemplars"
  }
],
v7 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "uri",
  "storageKey": null
},
v8 = [
  {
    "kind": "Variable",
    "name": "uri",
    "variableName": "patternClass"
  }
],
v9 = [
  (v5/*:: as any*/)
],
v10 = [
  {
    "kind": "Variable",
    "name": "uri",
    "variableName": "standardClass"
  }
],
v11 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "title",
  "storageKey": null
},
v12 = [
  {
    "kind": "TypeDiscriminator",
    "abstractKey": "__isUIBlock"
  }
],
v13 = [
  (v5/*:: as any*/),
  (v7/*:: as any*/)
];
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*:: as any*/),
      (v1/*:: as any*/),
      (v2/*:: as any*/),
      (v3/*:: as any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "LobbyQuery",
    "selections": [
      {
        "alias": "componentClass",
        "args": (v4/*:: as any*/),
        "concreteType": "OntologyClass",
        "kind": "LinkedField",
        "name": "ontologyClass",
        "plural": false,
        "selections": [
          (v5/*:: as any*/),
          {
            "alias": null,
            "args": (v6/*:: as any*/),
            "concreteType": "NodeConnection",
            "kind": "LinkedField",
            "name": "instances",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "NodeEdge",
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
                      (v7/*:: as any*/),
                      {
                        "args": null,
                        "kind": "FragmentSpread",
                        "name": "SiteChipProjection_node"
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
        "storageKey": null
      },
      {
        "alias": "patternClass",
        "args": (v8/*:: as any*/),
        "concreteType": "OntologyClass",
        "kind": "LinkedField",
        "name": "ontologyClass",
        "plural": false,
        "selections": (v9/*:: as any*/),
        "storageKey": null
      },
      {
        "alias": "standardClass",
        "args": (v10/*:: as any*/),
        "concreteType": "OntologyClass",
        "kind": "LinkedField",
        "name": "ontologyClass",
        "plural": false,
        "selections": (v9/*:: as any*/),
        "storageKey": null
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v0/*:: as any*/),
      (v2/*:: as any*/),
      (v3/*:: as any*/),
      (v1/*:: as any*/)
    ],
    "kind": "Operation",
    "name": "LobbyQuery",
    "selections": [
      {
        "alias": "componentClass",
        "args": (v4/*:: as any*/),
        "concreteType": "OntologyClass",
        "kind": "LinkedField",
        "name": "ontologyClass",
        "plural": false,
        "selections": [
          (v5/*:: as any*/),
          {
            "alias": null,
            "args": (v6/*:: as any*/),
            "concreteType": "NodeConnection",
            "kind": "LinkedField",
            "name": "instances",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "NodeEdge",
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
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "__typename",
                        "storageKey": null
                      },
                      (v7/*:: as any*/),
                      {
                        "kind": "TypeDiscriminator",
                        "abstractKey": "__isNode"
                      },
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "EntityMeta",
                        "kind": "LinkedField",
                        "name": "_meta",
                        "plural": false,
                        "selections": [
                          (v11/*:: as any*/),
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
                        "kind": "InlineFragment",
                        "selections": (v12/*:: as any*/),
                        "type": "Component",
                        "abstractKey": null
                      },
                      {
                        "kind": "InlineFragment",
                        "selections": (v12/*:: as any*/),
                        "type": "Pattern",
                        "abstractKey": null
                      },
                      {
                        "kind": "InlineFragment",
                        "selections": (v12/*:: as any*/),
                        "type": "Layout",
                        "abstractKey": null
                      },
                      {
                        "kind": "InlineFragment",
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
                                    "concreteType": "EntityMeta",
                                    "kind": "LinkedField",
                                    "name": "_meta",
                                    "plural": false,
                                    "selections": [
                                      (v11/*:: as any*/)
                                    ],
                                    "storageKey": null
                                  },
                                  (v7/*:: as any*/)
                                ],
                                "storageKey": null
                              }
                            ],
                            "storageKey": null
                          }
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
                                      (v7/*:: as any*/)
                                    ],
                                    "storageKey": null
                                  }
                                ],
                                "storageKey": null
                              }
                            ],
                            "storageKey": "modifiers(first:100)"
                          }
                        ],
                        "type": "ModifierFamily",
                        "abstractKey": null
                      }
                    ],
                    "storageKey": null
                  }
                ],
                "storageKey": null
              }
            ],
            "storageKey": null
          },
          (v7/*:: as any*/)
        ],
        "storageKey": null
      },
      {
        "alias": "patternClass",
        "args": (v8/*:: as any*/),
        "concreteType": "OntologyClass",
        "kind": "LinkedField",
        "name": "ontologyClass",
        "plural": false,
        "selections": (v13/*:: as any*/),
        "storageKey": null
      },
      {
        "alias": "standardClass",
        "args": (v10/*:: as any*/),
        "concreteType": "OntologyClass",
        "kind": "LinkedField",
        "name": "ontologyClass",
        "plural": false,
        "selections": (v13/*:: as any*/),
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "d8c7679b0cee7fca0af81c7778c68267",
    "id": null,
    "metadata": {},
    "name": "LobbyQuery",
    "operationKind": "query",
    "text": "query LobbyQuery(\n  $componentClass: String!\n  $patternClass: String!\n  $standardClass: String!\n  $exemplars: Int!\n) {\n  componentClass: ontologyClass(uri: $componentClass) {\n    instanceCount\n    instances(first: $exemplars) {\n      edges {\n        node {\n          __typename\n          uri\n          ...SiteChipProjection_node\n        }\n      }\n    }\n    uri\n  }\n  patternClass: ontologyClass(uri: $patternClass) {\n    instanceCount\n    uri\n  }\n  standardClass: ontologyClass(uri: $standardClass) {\n    instanceCount\n    uri\n  }\n}\n\nfragment ChipProjection_node on Node {\n  __isNode: __typename\n  __typename\n  ...NodeChip_node\n  ...OntologyClassChip_node\n}\n\nfragment CodeStandardChip_node on CodeStandard {\n  __typename\n  _meta {\n    title\n    curie\n  }\n}\n\nfragment ModifierChip_node on Modifier {\n  __typename\n  _meta {\n    title\n    curie\n    type {\n      _meta {\n        title\n      }\n      uri\n    }\n  }\n}\n\nfragment ModifierFamilyChip_node on ModifierFamily {\n  __typename\n  _meta {\n    title\n    curie\n  }\n  modifiers(first: 100) {\n    edges {\n      node {\n        uri\n      }\n    }\n  }\n}\n\nfragment NodeChip_node on Node {\n  __isNode: __typename\n  __typename\n  _meta {\n    title\n    curie\n  }\n}\n\nfragment OntologyClassChip_node on OntologyClass {\n  __typename\n  _meta {\n    title\n    curie\n  }\n}\n\nfragment SiteChipProjection_node on Node {\n  __isNode: __typename\n  __typename\n  ...ChipProjection_node\n  ... on Component {\n    ...UIBlockChip_node\n  }\n  ... on Pattern {\n    ...UIBlockChip_node\n  }\n  ... on Layout {\n    ...UIBlockChip_node\n  }\n  ...ModifierChip_node\n  ...ModifierFamilyChip_node\n  ...CodeStandardChip_node\n}\n\nfragment UIBlockChip_node on UIBlock {\n  __isUIBlock: __typename\n  __typename\n  _meta {\n    title\n    curie\n  }\n}\n"
  }
};
})();

(node as any).hash = "89ad8b17004547608dc6f1ea333ab3e5";

export default node;
