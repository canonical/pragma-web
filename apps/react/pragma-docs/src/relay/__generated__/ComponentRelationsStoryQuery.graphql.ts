/**
 * @generated SignedSource<<9f306d73dcff4a923bf41f2424948c5c>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ComponentRelationsStoryQuery$variables = Record<PropertyKey, never>;
export type ComponentRelationsStoryQuery$data = {
  readonly component: {
    readonly " $fragmentSpreads": FragmentRefs<"ComponentRelations_node">;
  } | null | undefined;
};
export type ComponentRelationsStoryQuery = {
  response: ComponentRelationsStoryQuery$data;
  variables: ComponentRelationsStoryQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "kind": "Literal",
    "name": "uri",
    "value": "ds:global.component.button"
  }
],
v1 = [
  {
    "kind": "Literal",
    "name": "first",
    "value": 24
  }
],
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "__typename",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "uri",
  "storageKey": null
},
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "title",
  "storageKey": null
},
v5 = [
  {
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
  (v3/*:: as any*/)
],
v6 = {
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
      "selections": (v5/*:: as any*/),
      "storageKey": null
    }
  ],
  "storageKey": null
},
v7 = {
  "kind": "InlineFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "isAbstract",
      "storageKey": null
    }
  ],
  "type": "OntologyClass",
  "abstractKey": null
},
v8 = [
  {
    "kind": "Literal",
    "name": "first",
    "value": 1
  }
],
v9 = [
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
                "selections": (v5/*:: as any*/),
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
],
v10 = {
  "kind": "InlineFragment",
  "selections": (v9/*:: as any*/),
  "type": "Component",
  "abstractKey": null
},
v11 = {
  "kind": "InlineFragment",
  "selections": (v9/*:: as any*/),
  "type": "Pattern",
  "abstractKey": null
},
v12 = {
  "kind": "InlineFragment",
  "selections": (v9/*:: as any*/),
  "type": "Layout",
  "abstractKey": null
},
v13 = {
  "kind": "InlineFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "concreteType": "ModifierFamily",
      "kind": "LinkedField",
      "name": "modifierFamily",
      "plural": false,
      "selections": (v5/*:: as any*/),
      "storageKey": null
    }
  ],
  "type": "Modifier",
  "abstractKey": null
},
v14 = {
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
                (v3/*:: as any*/)
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
},
v15 = {
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
              "selections": (v5/*:: as any*/),
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
},
v16 = [
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
          (v2/*:: as any*/),
          (v3/*:: as any*/),
          {
            "kind": "InlineFragment",
            "selections": [
              (v6/*:: as any*/),
              (v7/*:: as any*/),
              (v10/*:: as any*/),
              (v11/*:: as any*/),
              (v12/*:: as any*/),
              (v13/*:: as any*/),
              (v14/*:: as any*/),
              (v15/*:: as any*/)
            ],
            "type": "Node",
            "abstractKey": "__isNode"
          }
        ],
        "storageKey": null
      }
    ],
    "storageKey": null
  }
],
v17 = [
  (v3/*:: as any*/),
  {
    "kind": "InlineFragment",
    "selections": [
      (v2/*:: as any*/),
      (v6/*:: as any*/),
      (v7/*:: as any*/),
      (v10/*:: as any*/),
      (v11/*:: as any*/),
      (v12/*:: as any*/),
      (v13/*:: as any*/),
      (v14/*:: as any*/),
      (v15/*:: as any*/)
    ],
    "type": "Node",
    "abstractKey": "__isNode"
  }
],
v18 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "UIBlockConnection"
},
v19 = {
  "enumValues": null,
  "nullable": false,
  "plural": true,
  "type": "UIBlockEdge"
},
v20 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "UIBlock"
},
v21 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "String"
},
v22 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "EntityMeta"
},
v23 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "OntologyClass"
},
v24 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "ID"
},
v25 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "CategoryConnection"
},
v26 = {
  "enumValues": null,
  "nullable": false,
  "plural": true,
  "type": "CategoryEdge"
},
v27 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "Category"
},
v28 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "TagConnection"
},
v29 = {
  "enumValues": null,
  "nullable": false,
  "plural": true,
  "type": "TagEdge"
},
v30 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "Tag"
},
v31 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "Boolean"
},
v32 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "ModifierFamily"
},
v33 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "ModifierConnection"
},
v34 = {
  "enumValues": null,
  "nullable": false,
  "plural": true,
  "type": "ModifierEdge"
},
v35 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "Modifier"
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "ComponentRelationsStoryQuery",
    "selections": [
      {
        "alias": null,
        "args": (v0/*:: as any*/),
        "concreteType": "Component",
        "kind": "LinkedField",
        "name": "component",
        "plural": false,
        "selections": [
          {
            "args": [
              {
                "kind": "Literal",
                "name": "count",
                "value": 24
              }
            ],
            "kind": "FragmentSpread",
            "name": "ComponentRelations_node"
          }
        ],
        "storageKey": "component(uri:\"ds:global.component.button\")"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "ComponentRelationsStoryQuery",
    "selections": [
      {
        "alias": null,
        "args": (v0/*:: as any*/),
        "concreteType": "Component",
        "kind": "LinkedField",
        "name": "component",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": (v1/*:: as any*/),
            "concreteType": "UIBlockConnection",
            "kind": "LinkedField",
            "name": "inheritsFroms",
            "plural": false,
            "selections": (v16/*:: as any*/),
            "storageKey": "inheritsFroms(first:24)"
          },
          {
            "alias": null,
            "args": (v1/*:: as any*/),
            "concreteType": "UIBlockConnection",
            "kind": "LinkedField",
            "name": "specializedBies",
            "plural": false,
            "selections": (v16/*:: as any*/),
            "storageKey": "specializedBies(first:24)"
          },
          {
            "alias": null,
            "args": (v1/*:: as any*/),
            "concreteType": "UIBlockConnection",
            "kind": "LinkedField",
            "name": "variants",
            "plural": false,
            "selections": (v16/*:: as any*/),
            "storageKey": "variants(first:24)"
          },
          {
            "alias": null,
            "args": (v1/*:: as any*/),
            "concreteType": "UIBlockConnection",
            "kind": "LinkedField",
            "name": "variantOfs",
            "plural": false,
            "selections": (v16/*:: as any*/),
            "storageKey": "variantOfs(first:24)"
          },
          {
            "alias": null,
            "args": (v1/*:: as any*/),
            "concreteType": "SubcomponentConnection",
            "kind": "LinkedField",
            "name": "subcomponents",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "SubcomponentEdge",
                "kind": "LinkedField",
                "name": "edges",
                "plural": true,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "Subcomponent",
                    "kind": "LinkedField",
                    "name": "node",
                    "plural": false,
                    "selections": (v17/*:: as any*/),
                    "storageKey": null
                  }
                ],
                "storageKey": null
              }
            ],
            "storageKey": "subcomponents(first:24)"
          },
          {
            "alias": null,
            "args": (v1/*:: as any*/),
            "concreteType": "ModifierFamilyConnection",
            "kind": "LinkedField",
            "name": "modifierFamilies",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "ModifierFamilyEdge",
                "kind": "LinkedField",
                "name": "edges",
                "plural": true,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "ModifierFamily",
                    "kind": "LinkedField",
                    "name": "node",
                    "plural": false,
                    "selections": (v17/*:: as any*/),
                    "storageKey": null
                  }
                ],
                "storageKey": null
              }
            ],
            "storageKey": "modifierFamilies(first:24)"
          },
          (v3/*:: as any*/)
        ],
        "storageKey": "component(uri:\"ds:global.component.button\")"
      }
    ]
  },
  "params": {
    "cacheID": "5d2393d3c63d56b693c77d61e06ec3bc",
    "id": null,
    "metadata": {
      "relayTestingSelectionTypeInfo": {
        "component": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "Component"
        },
        "component.inheritsFroms": (v18/*:: as any*/),
        "component.inheritsFroms.edges": (v19/*:: as any*/),
        "component.inheritsFroms.edges.node": (v20/*:: as any*/),
        "component.inheritsFroms.edges.node.__isNode": (v21/*:: as any*/),
        "component.inheritsFroms.edges.node.__isUIBlock": (v21/*:: as any*/),
        "component.inheritsFroms.edges.node.__typename": (v21/*:: as any*/),
        "component.inheritsFroms.edges.node._meta": (v22/*:: as any*/),
        "component.inheritsFroms.edges.node._meta.curie": (v21/*:: as any*/),
        "component.inheritsFroms.edges.node._meta.title": (v21/*:: as any*/),
        "component.inheritsFroms.edges.node._meta.type": (v23/*:: as any*/),
        "component.inheritsFroms.edges.node._meta.type._meta": (v22/*:: as any*/),
        "component.inheritsFroms.edges.node._meta.type._meta.title": (v21/*:: as any*/),
        "component.inheritsFroms.edges.node._meta.type.uri": (v24/*:: as any*/),
        "component.inheritsFroms.edges.node.categories": (v25/*:: as any*/),
        "component.inheritsFroms.edges.node.categories.edges": (v26/*:: as any*/),
        "component.inheritsFroms.edges.node.categories.edges.node": (v27/*:: as any*/),
        "component.inheritsFroms.edges.node.categories.edges.node._meta": (v22/*:: as any*/),
        "component.inheritsFroms.edges.node.categories.edges.node._meta.title": (v21/*:: as any*/),
        "component.inheritsFroms.edges.node.categories.edges.node.uri": (v24/*:: as any*/),
        "component.inheritsFroms.edges.node.documentationStages": (v28/*:: as any*/),
        "component.inheritsFroms.edges.node.documentationStages.edges": (v29/*:: as any*/),
        "component.inheritsFroms.edges.node.documentationStages.edges.node": (v30/*:: as any*/),
        "component.inheritsFroms.edges.node.documentationStages.edges.node._meta": (v22/*:: as any*/),
        "component.inheritsFroms.edges.node.documentationStages.edges.node._meta.title": (v21/*:: as any*/),
        "component.inheritsFroms.edges.node.documentationStages.edges.node.uri": (v24/*:: as any*/),
        "component.inheritsFroms.edges.node.isAbstract": (v31/*:: as any*/),
        "component.inheritsFroms.edges.node.modifierFamily": (v32/*:: as any*/),
        "component.inheritsFroms.edges.node.modifierFamily._meta": (v22/*:: as any*/),
        "component.inheritsFroms.edges.node.modifierFamily._meta.title": (v21/*:: as any*/),
        "component.inheritsFroms.edges.node.modifierFamily.uri": (v24/*:: as any*/),
        "component.inheritsFroms.edges.node.modifiers": (v33/*:: as any*/),
        "component.inheritsFroms.edges.node.modifiers.edges": (v34/*:: as any*/),
        "component.inheritsFroms.edges.node.modifiers.edges.node": (v35/*:: as any*/),
        "component.inheritsFroms.edges.node.modifiers.edges.node.uri": (v24/*:: as any*/),
        "component.inheritsFroms.edges.node.uri": (v24/*:: as any*/),
        "component.modifierFamilies": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "ModifierFamilyConnection"
        },
        "component.modifierFamilies.edges": {
          "enumValues": null,
          "nullable": false,
          "plural": true,
          "type": "ModifierFamilyEdge"
        },
        "component.modifierFamilies.edges.node": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "ModifierFamily"
        },
        "component.modifierFamilies.edges.node.__isNode": (v21/*:: as any*/),
        "component.modifierFamilies.edges.node.__isUIBlock": (v21/*:: as any*/),
        "component.modifierFamilies.edges.node.__typename": (v21/*:: as any*/),
        "component.modifierFamilies.edges.node._meta": (v22/*:: as any*/),
        "component.modifierFamilies.edges.node._meta.curie": (v21/*:: as any*/),
        "component.modifierFamilies.edges.node._meta.title": (v21/*:: as any*/),
        "component.modifierFamilies.edges.node._meta.type": (v23/*:: as any*/),
        "component.modifierFamilies.edges.node._meta.type._meta": (v22/*:: as any*/),
        "component.modifierFamilies.edges.node._meta.type._meta.title": (v21/*:: as any*/),
        "component.modifierFamilies.edges.node._meta.type.uri": (v24/*:: as any*/),
        "component.modifierFamilies.edges.node.categories": (v25/*:: as any*/),
        "component.modifierFamilies.edges.node.categories.edges": (v26/*:: as any*/),
        "component.modifierFamilies.edges.node.categories.edges.node": (v27/*:: as any*/),
        "component.modifierFamilies.edges.node.categories.edges.node._meta": (v22/*:: as any*/),
        "component.modifierFamilies.edges.node.categories.edges.node._meta.title": (v21/*:: as any*/),
        "component.modifierFamilies.edges.node.categories.edges.node.uri": (v24/*:: as any*/),
        "component.modifierFamilies.edges.node.documentationStages": (v28/*:: as any*/),
        "component.modifierFamilies.edges.node.documentationStages.edges": (v29/*:: as any*/),
        "component.modifierFamilies.edges.node.documentationStages.edges.node": (v30/*:: as any*/),
        "component.modifierFamilies.edges.node.documentationStages.edges.node._meta": (v22/*:: as any*/),
        "component.modifierFamilies.edges.node.documentationStages.edges.node._meta.title": (v21/*:: as any*/),
        "component.modifierFamilies.edges.node.documentationStages.edges.node.uri": (v24/*:: as any*/),
        "component.modifierFamilies.edges.node.isAbstract": (v31/*:: as any*/),
        "component.modifierFamilies.edges.node.modifierFamily": (v32/*:: as any*/),
        "component.modifierFamilies.edges.node.modifierFamily._meta": (v22/*:: as any*/),
        "component.modifierFamilies.edges.node.modifierFamily._meta.title": (v21/*:: as any*/),
        "component.modifierFamilies.edges.node.modifierFamily.uri": (v24/*:: as any*/),
        "component.modifierFamilies.edges.node.modifiers": (v33/*:: as any*/),
        "component.modifierFamilies.edges.node.modifiers.edges": (v34/*:: as any*/),
        "component.modifierFamilies.edges.node.modifiers.edges.node": (v35/*:: as any*/),
        "component.modifierFamilies.edges.node.modifiers.edges.node.uri": (v24/*:: as any*/),
        "component.modifierFamilies.edges.node.uri": (v24/*:: as any*/),
        "component.specializedBies": (v18/*:: as any*/),
        "component.specializedBies.edges": (v19/*:: as any*/),
        "component.specializedBies.edges.node": (v20/*:: as any*/),
        "component.specializedBies.edges.node.__isNode": (v21/*:: as any*/),
        "component.specializedBies.edges.node.__isUIBlock": (v21/*:: as any*/),
        "component.specializedBies.edges.node.__typename": (v21/*:: as any*/),
        "component.specializedBies.edges.node._meta": (v22/*:: as any*/),
        "component.specializedBies.edges.node._meta.curie": (v21/*:: as any*/),
        "component.specializedBies.edges.node._meta.title": (v21/*:: as any*/),
        "component.specializedBies.edges.node._meta.type": (v23/*:: as any*/),
        "component.specializedBies.edges.node._meta.type._meta": (v22/*:: as any*/),
        "component.specializedBies.edges.node._meta.type._meta.title": (v21/*:: as any*/),
        "component.specializedBies.edges.node._meta.type.uri": (v24/*:: as any*/),
        "component.specializedBies.edges.node.categories": (v25/*:: as any*/),
        "component.specializedBies.edges.node.categories.edges": (v26/*:: as any*/),
        "component.specializedBies.edges.node.categories.edges.node": (v27/*:: as any*/),
        "component.specializedBies.edges.node.categories.edges.node._meta": (v22/*:: as any*/),
        "component.specializedBies.edges.node.categories.edges.node._meta.title": (v21/*:: as any*/),
        "component.specializedBies.edges.node.categories.edges.node.uri": (v24/*:: as any*/),
        "component.specializedBies.edges.node.documentationStages": (v28/*:: as any*/),
        "component.specializedBies.edges.node.documentationStages.edges": (v29/*:: as any*/),
        "component.specializedBies.edges.node.documentationStages.edges.node": (v30/*:: as any*/),
        "component.specializedBies.edges.node.documentationStages.edges.node._meta": (v22/*:: as any*/),
        "component.specializedBies.edges.node.documentationStages.edges.node._meta.title": (v21/*:: as any*/),
        "component.specializedBies.edges.node.documentationStages.edges.node.uri": (v24/*:: as any*/),
        "component.specializedBies.edges.node.isAbstract": (v31/*:: as any*/),
        "component.specializedBies.edges.node.modifierFamily": (v32/*:: as any*/),
        "component.specializedBies.edges.node.modifierFamily._meta": (v22/*:: as any*/),
        "component.specializedBies.edges.node.modifierFamily._meta.title": (v21/*:: as any*/),
        "component.specializedBies.edges.node.modifierFamily.uri": (v24/*:: as any*/),
        "component.specializedBies.edges.node.modifiers": (v33/*:: as any*/),
        "component.specializedBies.edges.node.modifiers.edges": (v34/*:: as any*/),
        "component.specializedBies.edges.node.modifiers.edges.node": (v35/*:: as any*/),
        "component.specializedBies.edges.node.modifiers.edges.node.uri": (v24/*:: as any*/),
        "component.specializedBies.edges.node.uri": (v24/*:: as any*/),
        "component.subcomponents": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "SubcomponentConnection"
        },
        "component.subcomponents.edges": {
          "enumValues": null,
          "nullable": false,
          "plural": true,
          "type": "SubcomponentEdge"
        },
        "component.subcomponents.edges.node": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "Subcomponent"
        },
        "component.subcomponents.edges.node.__isNode": (v21/*:: as any*/),
        "component.subcomponents.edges.node.__isUIBlock": (v21/*:: as any*/),
        "component.subcomponents.edges.node.__typename": (v21/*:: as any*/),
        "component.subcomponents.edges.node._meta": (v22/*:: as any*/),
        "component.subcomponents.edges.node._meta.curie": (v21/*:: as any*/),
        "component.subcomponents.edges.node._meta.title": (v21/*:: as any*/),
        "component.subcomponents.edges.node._meta.type": (v23/*:: as any*/),
        "component.subcomponents.edges.node._meta.type._meta": (v22/*:: as any*/),
        "component.subcomponents.edges.node._meta.type._meta.title": (v21/*:: as any*/),
        "component.subcomponents.edges.node._meta.type.uri": (v24/*:: as any*/),
        "component.subcomponents.edges.node.categories": (v25/*:: as any*/),
        "component.subcomponents.edges.node.categories.edges": (v26/*:: as any*/),
        "component.subcomponents.edges.node.categories.edges.node": (v27/*:: as any*/),
        "component.subcomponents.edges.node.categories.edges.node._meta": (v22/*:: as any*/),
        "component.subcomponents.edges.node.categories.edges.node._meta.title": (v21/*:: as any*/),
        "component.subcomponents.edges.node.categories.edges.node.uri": (v24/*:: as any*/),
        "component.subcomponents.edges.node.documentationStages": (v28/*:: as any*/),
        "component.subcomponents.edges.node.documentationStages.edges": (v29/*:: as any*/),
        "component.subcomponents.edges.node.documentationStages.edges.node": (v30/*:: as any*/),
        "component.subcomponents.edges.node.documentationStages.edges.node._meta": (v22/*:: as any*/),
        "component.subcomponents.edges.node.documentationStages.edges.node._meta.title": (v21/*:: as any*/),
        "component.subcomponents.edges.node.documentationStages.edges.node.uri": (v24/*:: as any*/),
        "component.subcomponents.edges.node.isAbstract": (v31/*:: as any*/),
        "component.subcomponents.edges.node.modifierFamily": (v32/*:: as any*/),
        "component.subcomponents.edges.node.modifierFamily._meta": (v22/*:: as any*/),
        "component.subcomponents.edges.node.modifierFamily._meta.title": (v21/*:: as any*/),
        "component.subcomponents.edges.node.modifierFamily.uri": (v24/*:: as any*/),
        "component.subcomponents.edges.node.modifiers": (v33/*:: as any*/),
        "component.subcomponents.edges.node.modifiers.edges": (v34/*:: as any*/),
        "component.subcomponents.edges.node.modifiers.edges.node": (v35/*:: as any*/),
        "component.subcomponents.edges.node.modifiers.edges.node.uri": (v24/*:: as any*/),
        "component.subcomponents.edges.node.uri": (v24/*:: as any*/),
        "component.uri": (v24/*:: as any*/),
        "component.variantOfs": (v18/*:: as any*/),
        "component.variantOfs.edges": (v19/*:: as any*/),
        "component.variantOfs.edges.node": (v20/*:: as any*/),
        "component.variantOfs.edges.node.__isNode": (v21/*:: as any*/),
        "component.variantOfs.edges.node.__isUIBlock": (v21/*:: as any*/),
        "component.variantOfs.edges.node.__typename": (v21/*:: as any*/),
        "component.variantOfs.edges.node._meta": (v22/*:: as any*/),
        "component.variantOfs.edges.node._meta.curie": (v21/*:: as any*/),
        "component.variantOfs.edges.node._meta.title": (v21/*:: as any*/),
        "component.variantOfs.edges.node._meta.type": (v23/*:: as any*/),
        "component.variantOfs.edges.node._meta.type._meta": (v22/*:: as any*/),
        "component.variantOfs.edges.node._meta.type._meta.title": (v21/*:: as any*/),
        "component.variantOfs.edges.node._meta.type.uri": (v24/*:: as any*/),
        "component.variantOfs.edges.node.categories": (v25/*:: as any*/),
        "component.variantOfs.edges.node.categories.edges": (v26/*:: as any*/),
        "component.variantOfs.edges.node.categories.edges.node": (v27/*:: as any*/),
        "component.variantOfs.edges.node.categories.edges.node._meta": (v22/*:: as any*/),
        "component.variantOfs.edges.node.categories.edges.node._meta.title": (v21/*:: as any*/),
        "component.variantOfs.edges.node.categories.edges.node.uri": (v24/*:: as any*/),
        "component.variantOfs.edges.node.documentationStages": (v28/*:: as any*/),
        "component.variantOfs.edges.node.documentationStages.edges": (v29/*:: as any*/),
        "component.variantOfs.edges.node.documentationStages.edges.node": (v30/*:: as any*/),
        "component.variantOfs.edges.node.documentationStages.edges.node._meta": (v22/*:: as any*/),
        "component.variantOfs.edges.node.documentationStages.edges.node._meta.title": (v21/*:: as any*/),
        "component.variantOfs.edges.node.documentationStages.edges.node.uri": (v24/*:: as any*/),
        "component.variantOfs.edges.node.isAbstract": (v31/*:: as any*/),
        "component.variantOfs.edges.node.modifierFamily": (v32/*:: as any*/),
        "component.variantOfs.edges.node.modifierFamily._meta": (v22/*:: as any*/),
        "component.variantOfs.edges.node.modifierFamily._meta.title": (v21/*:: as any*/),
        "component.variantOfs.edges.node.modifierFamily.uri": (v24/*:: as any*/),
        "component.variantOfs.edges.node.modifiers": (v33/*:: as any*/),
        "component.variantOfs.edges.node.modifiers.edges": (v34/*:: as any*/),
        "component.variantOfs.edges.node.modifiers.edges.node": (v35/*:: as any*/),
        "component.variantOfs.edges.node.modifiers.edges.node.uri": (v24/*:: as any*/),
        "component.variantOfs.edges.node.uri": (v24/*:: as any*/),
        "component.variants": (v18/*:: as any*/),
        "component.variants.edges": (v19/*:: as any*/),
        "component.variants.edges.node": (v20/*:: as any*/),
        "component.variants.edges.node.__isNode": (v21/*:: as any*/),
        "component.variants.edges.node.__isUIBlock": (v21/*:: as any*/),
        "component.variants.edges.node.__typename": (v21/*:: as any*/),
        "component.variants.edges.node._meta": (v22/*:: as any*/),
        "component.variants.edges.node._meta.curie": (v21/*:: as any*/),
        "component.variants.edges.node._meta.title": (v21/*:: as any*/),
        "component.variants.edges.node._meta.type": (v23/*:: as any*/),
        "component.variants.edges.node._meta.type._meta": (v22/*:: as any*/),
        "component.variants.edges.node._meta.type._meta.title": (v21/*:: as any*/),
        "component.variants.edges.node._meta.type.uri": (v24/*:: as any*/),
        "component.variants.edges.node.categories": (v25/*:: as any*/),
        "component.variants.edges.node.categories.edges": (v26/*:: as any*/),
        "component.variants.edges.node.categories.edges.node": (v27/*:: as any*/),
        "component.variants.edges.node.categories.edges.node._meta": (v22/*:: as any*/),
        "component.variants.edges.node.categories.edges.node._meta.title": (v21/*:: as any*/),
        "component.variants.edges.node.categories.edges.node.uri": (v24/*:: as any*/),
        "component.variants.edges.node.documentationStages": (v28/*:: as any*/),
        "component.variants.edges.node.documentationStages.edges": (v29/*:: as any*/),
        "component.variants.edges.node.documentationStages.edges.node": (v30/*:: as any*/),
        "component.variants.edges.node.documentationStages.edges.node._meta": (v22/*:: as any*/),
        "component.variants.edges.node.documentationStages.edges.node._meta.title": (v21/*:: as any*/),
        "component.variants.edges.node.documentationStages.edges.node.uri": (v24/*:: as any*/),
        "component.variants.edges.node.isAbstract": (v31/*:: as any*/),
        "component.variants.edges.node.modifierFamily": (v32/*:: as any*/),
        "component.variants.edges.node.modifierFamily._meta": (v22/*:: as any*/),
        "component.variants.edges.node.modifierFamily._meta.title": (v21/*:: as any*/),
        "component.variants.edges.node.modifierFamily.uri": (v24/*:: as any*/),
        "component.variants.edges.node.modifiers": (v33/*:: as any*/),
        "component.variants.edges.node.modifiers.edges": (v34/*:: as any*/),
        "component.variants.edges.node.modifiers.edges.node": (v35/*:: as any*/),
        "component.variants.edges.node.modifiers.edges.node.uri": (v24/*:: as any*/),
        "component.variants.edges.node.uri": (v24/*:: as any*/)
      }
    },
    "name": "ComponentRelationsStoryQuery",
    "operationKind": "query",
    "text": "query ComponentRelationsStoryQuery {\n  component(uri: \"ds:global.component.button\") {\n    ...ComponentRelations_node_2bxhYB\n    uri\n  }\n}\n\nfragment CodeStandardRow_node on CodeStandard {\n  __typename\n  _meta {\n    title\n    curie\n  }\n  categories(first: 1) {\n    edges {\n      node {\n        _meta {\n          title\n        }\n        uri\n      }\n    }\n  }\n}\n\nfragment ComponentRelations_node_2bxhYB on Component {\n  inheritsFroms(first: 24) {\n    edges {\n      node {\n        __typename\n        uri\n        ...SiteRowProjection_node\n      }\n    }\n  }\n  specializedBies(first: 24) {\n    edges {\n      node {\n        __typename\n        uri\n        ...SiteRowProjection_node\n      }\n    }\n  }\n  variants(first: 24) {\n    edges {\n      node {\n        __typename\n        uri\n        ...SiteRowProjection_node\n      }\n    }\n  }\n  variantOfs(first: 24) {\n    edges {\n      node {\n        __typename\n        uri\n        ...SiteRowProjection_node\n      }\n    }\n  }\n  subcomponents(first: 24) {\n    edges {\n      node {\n        uri\n        ...SiteRowProjection_node\n      }\n    }\n  }\n  modifierFamilies(first: 24) {\n    edges {\n      node {\n        uri\n        ...SiteRowProjection_node\n      }\n    }\n  }\n}\n\nfragment ModifierFamilyRow_node on ModifierFamily {\n  __typename\n  _meta {\n    title\n    curie\n  }\n  modifiers(first: 100) {\n    edges {\n      node {\n        uri\n      }\n    }\n  }\n}\n\nfragment ModifierRow_node on Modifier {\n  __typename\n  _meta {\n    title\n    curie\n  }\n  modifierFamily {\n    _meta {\n      title\n    }\n    uri\n  }\n}\n\nfragment NodeRow_node on Node {\n  __isNode: __typename\n  __typename\n  _meta {\n    title\n    curie\n    type {\n      _meta {\n        title\n      }\n      uri\n    }\n  }\n}\n\nfragment OntologyClassRow_node on OntologyClass {\n  __typename\n  isAbstract\n  _meta {\n    title\n    curie\n  }\n}\n\nfragment RowProjection_node on Node {\n  __isNode: __typename\n  __typename\n  ...NodeRow_node\n  ...SiteRowSlot_node\n  ...OntologyClassRow_node\n}\n\nfragment SiteRowProjection_node on Node {\n  __isNode: __typename\n  __typename\n  ...RowProjection_node\n  ... on Component {\n    ...UIBlockRow_node\n  }\n  ... on Pattern {\n    ...UIBlockRow_node\n  }\n  ... on Layout {\n    ...UIBlockRow_node\n  }\n  ...ModifierRow_node\n  ...ModifierFamilyRow_node\n  ...CodeStandardRow_node\n}\n\nfragment SiteRowSlot_node on Node {\n  __isNode: __typename\n  __typename\n}\n\nfragment UIBlockRow_node on UIBlock {\n  __isUIBlock: __typename\n  __typename\n  _meta {\n    title\n    curie\n  }\n  documentationStages(first: 1) {\n    edges {\n      node {\n        _meta {\n          title\n        }\n        uri\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "d90cbd9a3377ece2e6b5426552f26f53";

export default node;
