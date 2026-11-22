/**
 * @generated SignedSource<<59c7c184790a7e4cbeb2ac36d8e4b2a7>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type FieldFilter = {
  field: string;
  values?: ReadonlyArray<string | null | undefined> | null | undefined;
};
export type EntityIndexQuery$variables = {
  classId: string;
  classUri: string;
  count: number;
  cursor?: string | null | undefined;
  filters?: ReadonlyArray<FieldFilter> | null | undefined;
};
export type EntityIndexQuery$data = {
  readonly " $fragmentSpreads": FragmentRefs<"EntityIndex_query">;
};
export type EntityIndexQuery = {
  response: EntityIndexQuery$data;
  variables: EntityIndexQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "classId"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "classUri"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "count"
},
v3 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "cursor"
},
v4 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "filters"
},
v5 = {
  "kind": "Variable",
  "name": "filters",
  "variableName": "filters"
},
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "uri",
  "storageKey": null
},
v7 = [
  {
    "kind": "Variable",
    "name": "after",
    "variableName": "cursor"
  },
  {
    "kind": "Variable",
    "name": "classUri",
    "variableName": "classId"
  },
  (v5/*:: as any*/),
  {
    "kind": "Variable",
    "name": "first",
    "variableName": "count"
  }
],
v8 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "field",
  "storageKey": null
},
v9 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "label",
  "storageKey": null
},
v10 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "__typename",
  "storageKey": null
},
v11 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "title",
  "storageKey": null
},
v12 = [
  (v6/*:: as any*/)
],
v13 = {
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
v14 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "definition",
  "storageKey": null
},
v15 = [
  (v13/*:: as any*/),
  (v6/*:: as any*/)
],
v16 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "version",
  "storageKey": null
},
v17 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "summary",
  "storageKey": null
},
v18 = [
  {
    "kind": "Literal",
    "name": "first",
    "value": 1
  }
],
v19 = [
  {
    "kind": "InlineFragment",
    "selections": [
      (v16/*:: as any*/),
      (v17/*:: as any*/),
      {
        "alias": null,
        "args": null,
        "concreteType": "Tier",
        "kind": "LinkedField",
        "name": "tier",
        "plural": false,
        "selections": (v15/*:: as any*/),
        "storageKey": null
      },
      {
        "alias": null,
        "args": (v18/*:: as any*/),
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
                  (v10/*:: as any*/),
                  (v13/*:: as any*/),
                  (v6/*:: as any*/)
                ],
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
        "args": (v18/*:: as any*/),
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
                "selections": (v15/*:: as any*/),
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
  }
];
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*:: as any*/),
      (v1/*:: as any*/),
      (v2/*:: as any*/),
      (v3/*:: as any*/),
      (v4/*:: as any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "EntityIndexQuery",
    "selections": [
      {
        "args": [
          {
            "kind": "Variable",
            "name": "classId",
            "variableName": "classId"
          },
          {
            "kind": "Variable",
            "name": "classUri",
            "variableName": "classUri"
          },
          {
            "kind": "Variable",
            "name": "count",
            "variableName": "count"
          },
          {
            "kind": "Variable",
            "name": "cursor",
            "variableName": "cursor"
          },
          (v5/*:: as any*/)
        ],
        "kind": "FragmentSpread",
        "name": "EntityIndex_query"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v1/*:: as any*/),
      (v0/*:: as any*/),
      (v4/*:: as any*/),
      (v2/*:: as any*/),
      (v3/*:: as any*/)
    ],
    "kind": "Operation",
    "name": "EntityIndexQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "Ontology",
        "kind": "LinkedField",
        "name": "ontologies",
        "plural": true,
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "prefix",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "namespace",
            "storageKey": null
          }
        ],
        "storageKey": null
      },
      {
        "alias": null,
        "args": [
          {
            "kind": "Variable",
            "name": "uri",
            "variableName": "classUri"
          }
        ],
        "concreteType": "OntologyClass",
        "kind": "LinkedField",
        "name": "ontologyClass",
        "plural": false,
        "selections": [
          (v6/*:: as any*/),
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "instanceCount",
            "storageKey": null
          }
        ],
        "storageKey": null
      },
      {
        "alias": null,
        "args": (v7/*:: as any*/),
        "concreteType": "FacetedConnection",
        "kind": "LinkedField",
        "name": "facetedInstances",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "totalCount",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "Facet",
            "kind": "LinkedField",
            "name": "facets",
            "plural": true,
            "selections": [
              (v8/*:: as any*/),
              (v9/*:: as any*/),
              {
                "alias": null,
                "args": null,
                "concreteType": "FacetValue",
                "kind": "LinkedField",
                "name": "values",
                "plural": true,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "value",
                    "storageKey": null
                  },
                  (v9/*:: as any*/),
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "count",
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
                  (v10/*:: as any*/),
                  (v6/*:: as any*/),
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
                      },
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "OntologyClass",
                        "kind": "LinkedField",
                        "name": "type",
                        "plural": false,
                        "selections": [
                          (v6/*:: as any*/),
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
                            "concreteType": "OntologyClass",
                            "kind": "LinkedField",
                            "name": "superclasses",
                            "plural": true,
                            "selections": (v12/*:: as any*/),
                            "storageKey": null
                          },
                          (v13/*:: as any*/)
                        ],
                        "storageKey": null
                      },
                      (v14/*:: as any*/)
                    ],
                    "storageKey": null
                  },
                  {
                    "kind": "TypeDiscriminator",
                    "abstractKey": "__isNode"
                  },
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "NodeValue",
                    "kind": "LinkedField",
                    "name": "values",
                    "plural": true,
                    "selections": [
                      (v8/*:: as any*/),
                      (v9/*:: as any*/),
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "text",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "type",
                        "storageKey": null
                      }
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
                      (v14/*:: as any*/),
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "OntologyClass",
                        "kind": "LinkedField",
                        "name": "superclass",
                        "plural": false,
                        "selections": (v15/*:: as any*/),
                        "storageKey": null
                      }
                    ],
                    "type": "OntologyClass",
                    "abstractKey": null
                  },
                  {
                    "kind": "InlineFragment",
                    "selections": (v19/*:: as any*/),
                    "type": "Component",
                    "abstractKey": null
                  },
                  {
                    "kind": "InlineFragment",
                    "selections": (v19/*:: as any*/),
                    "type": "Pattern",
                    "abstractKey": null
                  },
                  {
                    "kind": "InlineFragment",
                    "selections": (v19/*:: as any*/),
                    "type": "Layout",
                    "abstractKey": null
                  },
                  {
                    "kind": "InlineFragment",
                    "selections": [
                      (v16/*:: as any*/),
                      (v17/*:: as any*/),
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "ModifierFamily",
                        "kind": "LinkedField",
                        "name": "modifierFamily",
                        "plural": false,
                        "selections": (v15/*:: as any*/),
                        "storageKey": null
                      }
                    ],
                    "type": "Modifier",
                    "abstractKey": null
                  },
                  {
                    "kind": "InlineFragment",
                    "selections": [
                      (v17/*:: as any*/),
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
                                "selections": (v12/*:: as any*/),
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
                  },
                  {
                    "kind": "InlineFragment",
                    "selections": [
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "description",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": (v18/*:: as any*/),
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
                                "selections": (v15/*:: as any*/),
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
                  }
                ],
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "cursor",
                "storageKey": null
              }
            ],
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "PageInfo",
            "kind": "LinkedField",
            "name": "pageInfo",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "endCursor",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "hasNextPage",
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
        "args": (v7/*:: as any*/),
        "filters": [
          "classUri",
          "filters"
        ],
        "handle": "connection",
        "key": "EntityIndex_facetedInstances",
        "kind": "LinkedHandle",
        "name": "facetedInstances"
      }
    ]
  },
  "params": {
    "cacheID": "9ab610aecde0e1fa341368649519d048",
    "id": null,
    "metadata": {},
    "name": "EntityIndexQuery",
    "operationKind": "query",
    "text": "query EntityIndexQuery(\n  $classUri: String!\n  $classId: ID!\n  $filters: [FieldFilter!]\n  $count: Int!\n  $cursor: String\n) {\n  ...EntityIndex_query_4po9eA\n}\n\nfragment CardProjection_node on Node {\n  __isNode: __typename\n  __typename\n  ...NodeCard_node\n  ...SiteCardSlot_node\n  ...OntologyClassCard_node\n}\n\nfragment CodeStandardCard_node on CodeStandard {\n  __typename\n  description\n  _meta {\n    title\n    curie\n  }\n  categories(first: 1) {\n    edges {\n      node {\n        _meta {\n          title\n        }\n        uri\n      }\n    }\n  }\n}\n\nfragment CodeStandardRow_node on CodeStandard {\n  __typename\n  description\n  _meta {\n    title\n    curie\n  }\n  categories(first: 1) {\n    edges {\n      node {\n        _meta {\n          title\n        }\n        uri\n      }\n    }\n  }\n}\n\nfragment DocsCardProjection_node on Node {\n  __isNode: __typename\n  __typename\n  ...NodeCard_node\n  ...OntologyClassCard_node\n  ... on Component {\n    ...UIBlockCard_node\n  }\n  ... on Pattern {\n    ...UIBlockCard_node\n  }\n  ... on Layout {\n    ...UIBlockCard_node\n  }\n  ...ModifierCard_node\n  ...ModifierFamilyCard_node\n  ...CodeStandardCard_node\n}\n\nfragment DocsRowProjection_node on Node {\n  __isNode: __typename\n  __typename\n  ...NodeRow_node\n  ...OntologyClassRow_node\n  ... on Component {\n    ...UIBlockRow_node\n  }\n  ... on Pattern {\n    ...UIBlockRow_node\n  }\n  ... on Layout {\n    ...UIBlockRow_node\n  }\n  ...ModifierRow_node\n  ...ModifierFamilyRow_node\n  ...CodeStandardRow_node\n}\n\nfragment EntityIndex_query_4po9eA on Query {\n  ontologies {\n    prefix\n    namespace\n  }\n  ontologyClass(uri: $classUri) {\n    uri\n    instanceCount\n  }\n  facetedInstances(classUri: $classId, filters: $filters, first: $count, after: $cursor) {\n    totalCount\n    facets {\n      field\n      label\n      values {\n        value\n        label\n        count\n      }\n    }\n    edges {\n      node {\n        __typename\n        uri\n        _meta {\n          title\n          curie\n        }\n        ...NodeList_node\n      }\n      cursor\n    }\n    pageInfo {\n      endCursor\n      hasNextPage\n    }\n  }\n}\n\nfragment ModifierCard_node on Modifier {\n  __typename\n  version\n  summary\n  _meta {\n    title\n    curie\n  }\n  modifierFamily {\n    _meta {\n      title\n    }\n    uri\n  }\n}\n\nfragment ModifierFamilyCard_node on ModifierFamily {\n  __typename\n  summary\n  _meta {\n    title\n    curie\n  }\n  modifiers(first: 100) {\n    edges {\n      node {\n        uri\n      }\n    }\n  }\n}\n\nfragment ModifierFamilyRow_node on ModifierFamily {\n  __typename\n  summary\n  _meta {\n    title\n    curie\n  }\n  modifiers(first: 100) {\n    edges {\n      node {\n        uri\n      }\n    }\n  }\n}\n\nfragment ModifierRow_node on Modifier {\n  __typename\n  summary\n  _meta {\n    title\n    curie\n  }\n  modifierFamily {\n    _meta {\n      title\n    }\n    uri\n  }\n}\n\nfragment NodeCard_node on Node {\n  __isNode: __typename\n  __typename\n  _meta {\n    title\n    curie\n    definition\n    type {\n      _meta {\n        title\n      }\n      uri\n    }\n  }\n}\n\nfragment NodeList_node on Node {\n  __isNode: __typename\n  __typename\n  uri\n  _meta {\n    title\n    curie\n    type {\n      uri\n      visibility\n      superclasses {\n        uri\n      }\n    }\n  }\n  values {\n    field\n    label\n    text\n    type\n  }\n  ...CardProjection_node\n  ...RowProjection_node\n}\n\nfragment NodeRow_node on Node {\n  __isNode: __typename\n  __typename\n  _meta {\n    title\n    curie\n    type {\n      _meta {\n        title\n      }\n      uri\n    }\n  }\n}\n\nfragment OntologyClassCard_node on OntologyClass {\n  __typename\n  isAbstract\n  definition\n  _meta {\n    title\n    curie\n  }\n  superclass {\n    _meta {\n      title\n    }\n    uri\n  }\n}\n\nfragment OntologyClassRow_node on OntologyClass {\n  __typename\n  isAbstract\n  definition\n  _meta {\n    title\n    curie\n  }\n}\n\nfragment RowProjection_node on Node {\n  __isNode: __typename\n  __typename\n  ...NodeRow_node\n  ...SiteRowSlot_node\n  ...OntologyClassRow_node\n}\n\nfragment SiteCardSlot_node on Node {\n  __isNode: __typename\n  ...DocsCardProjection_node\n}\n\nfragment SiteRowSlot_node on Node {\n  __isNode: __typename\n  ...DocsRowProjection_node\n}\n\nfragment UIBlockCard_node on UIBlock {\n  __isUIBlock: __typename\n  __typename\n  version\n  summary\n  _meta {\n    title\n    curie\n  }\n  tier {\n    _meta {\n      title\n    }\n    uri\n  }\n  inheritsFroms(first: 1) {\n    edges {\n      node {\n        __typename\n        _meta {\n          title\n        }\n        uri\n      }\n    }\n  }\n  documentationStages(first: 1) {\n    edges {\n      node {\n        _meta {\n          title\n        }\n        uri\n      }\n    }\n  }\n}\n\nfragment UIBlockRow_node on UIBlock {\n  __isUIBlock: __typename\n  __typename\n  summary\n  _meta {\n    title\n    curie\n  }\n  documentationStages(first: 1) {\n    edges {\n      node {\n        _meta {\n          title\n        }\n        uri\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "fd61a403ab55c022ca18691894091394";

export default node;
