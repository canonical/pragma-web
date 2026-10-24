/**
 * A serialised Relay store snapshot for `ComponentEntityQuery` at
 * { uri: "ds:global.component.card", count: 24 }: the store the prepare step
 * serialises (`getStore().getSource().toJSON()`) after the operation runs
 * against the graph server, nothing trimmed. Regenerate by booting
 * `graph` and running the operation through `createEnvironment`, or by
 * copying `relay.records` out of the `__INITIAL_DATA__` script served at
 * /components/ds%3Aglobal.component.card.
 *
 * The literal is wider than `RecordMap`'s nominal record type (and
 * `RecordMap` isn't root-exported from relay-runtime — hence the deep
 * import) — hence the double cast at the end.
 */

import type { RecordMap } from "relay-runtime/store/RelayStoreTypes.js";

const componentEntityRecordsCard = {
  "client:root": {
    __id: "client:root",
    __typename: "__Root",
    'component(uri:"ds:global.component.card")': {
      __ref: "https://ds.canonical.com/global.component.card",
    },
  },
  "https://ds.canonical.com/global.component.card": {
    __id: "https://ds.canonical.com/global.component.card",
    __typename: "Component",
    name: "Card",
    uri: "https://ds.canonical.com/global.component.card",
    _meta: {
      __ref: "client:https://ds.canonical.com/global.component.card:_meta",
    },
    summary:
      "The card is a container that is designed to represent data objects that share the same structure. Unlike the more flexible [Tile](https://docs.superhuman.com/d/_dNyzE_TLZDh#_tugrid-20dWwIHYhx/_rui-eThhoLZg3Y), a card is designed to have multiple units displayed beside one another. Because of this, the card has a predictable structure that allows the user to compare attributes across data objects.\n\n",
    version: null,
    tier: {
      __ref: "https://ds.canonical.com/global",
    },
    "documentationStages(first:1)": {
      __ref:
        "client:https://ds.canonical.com/global.component.card:documentationStages(first:1)",
    },
    anatomyDsl:
      '---\n# Authored 2026-09-13 from @canonical/react-ds-global src/lib/component/Card/styles.css on .ds.card\n# The Card is not a surface: it sets no background, so it reads flush on\n# whatever surface it sits on and stays delimited by its border, its radius and\n# the dividers between its sections. It is always a grid participant and a ROW\n# SUBGRID over four fixed section tracks — image, header, content, footer.\nnode:\n  uri: global.component.card\n  styles:\n    layout.type: grid\n    layout.grid.rows: subgrid\n    layout.grid.columns: "minmax(0, 1fr)"\n    # Spans --card-span parent columns (a component-local count, default 1) and\n    # its own four section rows.\n    layout.grid.column: "span 1"\n    layout.grid.row: "span 4"\n    appearance.border.width: dimension.stroke.thickness.medium\n    appearance.border.style: solid\n    appearance.border.color: color.border.muted\n    appearance.radius: dimension.radius.medium\n    # Clips section corners (a full-bleed image) to the card radius.\n    layout.overflow: hidden\n  edges:\n    # Each section sits on its fixed row track and spans the card\'s single\n    # column. An absent section leaves its track empty for this card only.\n    # Image, content and footer draw a divider on their block-end edge when\n    # they are not the last section; the header draws none, so title and\n    # content read as one region.\n    - node:\n        uri: global.subcomponent.card-image\n        styles:\n          layout.grid.row: "1"\n          layout.grid.column: "1 / -1"\n          appearance.border.bottom.color: color.border.muted\n      relation:\n        cardinality: "0..1"\n        slotName: media\n    - node:\n        uri: global.subcomponent.card-header\n        styles:\n          layout.grid.row: "2"\n          layout.grid.column: "1 / -1"\n          # Collapsed to raw 0 when a content section follows, to close the\n          # header/content seam — unthemeable by design.\n          spacing.internal.block.end: 0\n      relation:\n        cardinality: "0..1"\n        slotName: header\n    - node:\n        uri: global.subcomponent.card-content\n        styles:\n          layout.grid.row: "3"\n          layout.grid.column: "1 / -1"\n          appearance.border.bottom.color: color.border.muted\n      relation:\n        cardinality: "1"\n        slotName: default\n    - node:\n        uri: global.subcomponent.card-footer\n        styles:\n          layout.grid.row: "4"\n          layout.grid.column: "1 / -1"\n          appearance.border.bottom.color: color.border.muted\n      relation:\n        cardinality: "0..1"\n        slotName: footer',
    properties: {
      __refs: [
        "client:https://ds.canonical.com/global.component.card:properties:0",
      ],
    },
    "inheritsFroms(first:24)": {
      __ref:
        "client:https://ds.canonical.com/global.component.card:inheritsFroms(first:24)",
    },
    "specializedBies(first:24)": {
      __ref:
        "client:https://ds.canonical.com/global.component.card:specializedBies(first:24)",
    },
    "variants(first:24)": {
      __ref:
        "client:https://ds.canonical.com/global.component.card:variants(first:24)",
    },
    "variantOfs(first:24)": {
      __ref:
        "client:https://ds.canonical.com/global.component.card:variantOfs(first:24)",
    },
    "subcomponents(first:24)": {
      __ref:
        "client:https://ds.canonical.com/global.component.card:subcomponents(first:24)",
    },
    "modifierFamilies(first:24)": {
      __ref:
        "client:https://ds.canonical.com/global.component.card:modifierFamilies(first:24)",
    },
  },
  "client:https://ds.canonical.com/global.component.card:_meta": {
    __id: "client:https://ds.canonical.com/global.component.card:_meta",
    __typename: "EntityMeta",
    curie: "ds:global.component.card",
  },
  "https://ds.canonical.com/global": {
    __id: "https://ds.canonical.com/global",
    __typename: "Tier",
    name: "Global",
    uri: "https://ds.canonical.com/global",
  },
  "client:https://ds.canonical.com/global.component.card:documentationStages(first:1)":
    {
      __id: "client:https://ds.canonical.com/global.component.card:documentationStages(first:1)",
      __typename: "TagConnection",
      edges: {
        __refs: [
          "client:https://ds.canonical.com/global.component.card:documentationStages(first:1):edges:0",
        ],
      },
    },
  "client:https://ds.canonical.com/global.component.card:documentationStages(first:1):edges:0":
    {
      __id: "client:https://ds.canonical.com/global.component.card:documentationStages(first:1):edges:0",
      __typename: "TagEdge",
      node: {
        __ref: "https://ds.canonical.com/tag.needsdocumentation",
      },
    },
  "https://ds.canonical.com/tag.needsdocumentation": {
    __id: "https://ds.canonical.com/tag.needsdocumentation",
    __typename: "Tag",
    _meta: {
      __ref: "client:https://ds.canonical.com/tag.needsdocumentation:_meta",
    },
    uri: "https://ds.canonical.com/tag.needsdocumentation",
  },
  "client:https://ds.canonical.com/tag.needsdocumentation:_meta": {
    __id: "client:https://ds.canonical.com/tag.needsdocumentation:_meta",
    __typename: "EntityMeta",
    title: "needs:documentation",
  },
  "client:https://ds.canonical.com/global.component.card:properties:0": {
    __id: "client:https://ds.canonical.com/global.component.card:properties:0",
    __typename: "Property",
    name: null,
    propertyType: null,
    optional: false,
    defaultValue: null,
    constraints: null,
    summary: null,
  },
  "client:https://ds.canonical.com/global.component.card:inheritsFroms(first:24)":
    {
      __id: "client:https://ds.canonical.com/global.component.card:inheritsFroms(first:24)",
      __typename: "UIBlockConnection",
      edges: {
        __refs: [],
      },
    },
  "client:https://ds.canonical.com/global.component.card:specializedBies(first:24)":
    {
      __id: "client:https://ds.canonical.com/global.component.card:specializedBies(first:24)",
      __typename: "UIBlockConnection",
      edges: {
        __refs: [
          "client:https://ds.canonical.com/global.component.card:specializedBies(first:24):edges:0",
        ],
      },
    },
  "client:https://ds.canonical.com/global.component.card:specializedBies(first:24):edges:0":
    {
      __id: "client:https://ds.canonical.com/global.component.card:specializedBies(first:24):edges:0",
      __typename: "UIBlockEdge",
      node: {
        __ref:
          "https://ds.canonical.com/apps_workplaceengineering.pattern.travel_provider_card",
      },
    },
  "https://ds.canonical.com/apps_workplaceengineering.pattern.travel_provider_card":
    {
      __id: "https://ds.canonical.com/apps_workplaceengineering.pattern.travel_provider_card",
      __typename: "Pattern",
      uri: "https://ds.canonical.com/apps_workplaceengineering.pattern.travel_provider_card",
      _meta: {
        __ref:
          "client:https://ds.canonical.com/apps_workplaceengineering.pattern.travel_provider_card:_meta",
      },
      "documentationStages(first:1)": {
        __ref:
          "client:https://ds.canonical.com/apps_workplaceengineering.pattern.travel_provider_card:documentationStages(first:1)",
      },
    },
  "client:__type:Pattern": {
    __id: "client:__type:Pattern",
    __typename: "__TypeSchema",
    __isNode: true,
    __isUIBlock: true,
  },
  "client:https://ds.canonical.com/apps_workplaceengineering.pattern.travel_provider_card:_meta":
    {
      __id: "client:https://ds.canonical.com/apps_workplaceengineering.pattern.travel_provider_card:_meta",
      __typename: "EntityMeta",
      title: "TravelProviderCard",
      curie: "ds:apps_workplaceengineering.pattern.travel_provider_card",
      type: {
        __ref: "https://ds.canonical.com/Pattern",
      },
    },
  "https://ds.canonical.com/Pattern": {
    __id: "https://ds.canonical.com/Pattern",
    __typename: "OntologyClass",
    _meta: {
      __ref: "client:https://ds.canonical.com/Pattern:_meta",
    },
    uri: "https://ds.canonical.com/Pattern",
  },
  "client:https://ds.canonical.com/Pattern:_meta": {
    __id: "client:https://ds.canonical.com/Pattern:_meta",
    __typename: "EntityMeta",
    title: "Pattern",
  },
  "client:https://ds.canonical.com/apps_workplaceengineering.pattern.travel_provider_card:documentationStages(first:1)":
    {
      __id: "client:https://ds.canonical.com/apps_workplaceengineering.pattern.travel_provider_card:documentationStages(first:1)",
      __typename: "TagConnection",
      edges: {
        __refs: [
          "client:https://ds.canonical.com/apps_workplaceengineering.pattern.travel_provider_card:documentationStages(first:1):edges:0",
        ],
      },
    },
  "client:https://ds.canonical.com/apps_workplaceengineering.pattern.travel_provider_card:documentationStages(first:1):edges:0":
    {
      __id: "client:https://ds.canonical.com/apps_workplaceengineering.pattern.travel_provider_card:documentationStages(first:1):edges:0",
      __typename: "TagEdge",
      node: {
        __ref: "https://ds.canonical.com/tag.needsdefinition",
      },
    },
  "https://ds.canonical.com/tag.needsdefinition": {
    __id: "https://ds.canonical.com/tag.needsdefinition",
    __typename: "Tag",
    _meta: {
      __ref: "client:https://ds.canonical.com/tag.needsdefinition:_meta",
    },
    uri: "https://ds.canonical.com/tag.needsdefinition",
  },
  "client:https://ds.canonical.com/tag.needsdefinition:_meta": {
    __id: "client:https://ds.canonical.com/tag.needsdefinition:_meta",
    __typename: "EntityMeta",
    title: "needs:definition",
  },
  "client:https://ds.canonical.com/global.component.card:variants(first:24)": {
    __id: "client:https://ds.canonical.com/global.component.card:variants(first:24)",
    __typename: "UIBlockConnection",
    edges: {
      __refs: [],
    },
  },
  "client:https://ds.canonical.com/global.component.card:variantOfs(first:24)":
    {
      __id: "client:https://ds.canonical.com/global.component.card:variantOfs(first:24)",
      __typename: "UIBlockConnection",
      edges: {
        __refs: [],
      },
    },
  "client:https://ds.canonical.com/global.component.card:subcomponents(first:24)":
    {
      __id: "client:https://ds.canonical.com/global.component.card:subcomponents(first:24)",
      __typename: "SubcomponentConnection",
      edges: {
        __refs: [
          "client:https://ds.canonical.com/global.component.card:subcomponents(first:24):edges:0",
          "client:https://ds.canonical.com/global.component.card:subcomponents(first:24):edges:1",
          "client:https://ds.canonical.com/global.component.card:subcomponents(first:24):edges:2",
          "client:https://ds.canonical.com/global.component.card:subcomponents(first:24):edges:3",
          "client:https://ds.canonical.com/global.component.card:subcomponents(first:24):edges:4",
        ],
      },
    },
  "client:https://ds.canonical.com/global.component.card:subcomponents(first:24):edges:0":
    {
      __id: "client:https://ds.canonical.com/global.component.card:subcomponents(first:24):edges:0",
      __typename: "SubcomponentEdge",
      node: {
        __ref: "https://ds.canonical.com/global.subcomponent.card-content",
      },
    },
  "https://ds.canonical.com/global.subcomponent.card-content": {
    __id: "https://ds.canonical.com/global.subcomponent.card-content",
    __typename: "Subcomponent",
    uri: "https://ds.canonical.com/global.subcomponent.card-content",
    _meta: {
      __ref:
        "client:https://ds.canonical.com/global.subcomponent.card-content:_meta",
    },
  },
  "client:__type:Subcomponent": {
    __id: "client:__type:Subcomponent",
    __typename: "__TypeSchema",
    __isNode: true,
  },
  "client:https://ds.canonical.com/global.subcomponent.card-content:_meta": {
    __id: "client:https://ds.canonical.com/global.subcomponent.card-content:_meta",
    __typename: "EntityMeta",
    title: "Card.Content",
    curie: "ds:global.subcomponent.card-content",
    type: {
      __ref: "https://ds.canonical.com/Subcomponent",
    },
  },
  "https://ds.canonical.com/Subcomponent": {
    __id: "https://ds.canonical.com/Subcomponent",
    __typename: "OntologyClass",
    _meta: {
      __ref: "client:https://ds.canonical.com/Subcomponent:_meta",
    },
    uri: "https://ds.canonical.com/Subcomponent",
  },
  "client:https://ds.canonical.com/Subcomponent:_meta": {
    __id: "client:https://ds.canonical.com/Subcomponent:_meta",
    __typename: "EntityMeta",
    title: "Subcomponent",
  },
  "client:https://ds.canonical.com/global.component.card:subcomponents(first:24):edges:1":
    {
      __id: "client:https://ds.canonical.com/global.component.card:subcomponents(first:24):edges:1",
      __typename: "SubcomponentEdge",
      node: {
        __ref: "https://ds.canonical.com/global.subcomponent.card-footer",
      },
    },
  "https://ds.canonical.com/global.subcomponent.card-footer": {
    __id: "https://ds.canonical.com/global.subcomponent.card-footer",
    __typename: "Subcomponent",
    uri: "https://ds.canonical.com/global.subcomponent.card-footer",
    _meta: {
      __ref:
        "client:https://ds.canonical.com/global.subcomponent.card-footer:_meta",
    },
  },
  "client:https://ds.canonical.com/global.subcomponent.card-footer:_meta": {
    __id: "client:https://ds.canonical.com/global.subcomponent.card-footer:_meta",
    __typename: "EntityMeta",
    title: "Card.Footer",
    curie: "ds:global.subcomponent.card-footer",
    type: {
      __ref: "https://ds.canonical.com/Subcomponent",
    },
  },
  "client:https://ds.canonical.com/global.component.card:subcomponents(first:24):edges:2":
    {
      __id: "client:https://ds.canonical.com/global.component.card:subcomponents(first:24):edges:2",
      __typename: "SubcomponentEdge",
      node: {
        __ref: "https://ds.canonical.com/global.subcomponent.card-header",
      },
    },
  "https://ds.canonical.com/global.subcomponent.card-header": {
    __id: "https://ds.canonical.com/global.subcomponent.card-header",
    __typename: "Subcomponent",
    uri: "https://ds.canonical.com/global.subcomponent.card-header",
    _meta: {
      __ref:
        "client:https://ds.canonical.com/global.subcomponent.card-header:_meta",
    },
  },
  "client:https://ds.canonical.com/global.subcomponent.card-header:_meta": {
    __id: "client:https://ds.canonical.com/global.subcomponent.card-header:_meta",
    __typename: "EntityMeta",
    title: "Card.Header",
    curie: "ds:global.subcomponent.card-header",
    type: {
      __ref: "https://ds.canonical.com/Subcomponent",
    },
  },
  "client:https://ds.canonical.com/global.component.card:subcomponents(first:24):edges:3":
    {
      __id: "client:https://ds.canonical.com/global.component.card:subcomponents(first:24):edges:3",
      __typename: "SubcomponentEdge",
      node: {
        __ref: "https://ds.canonical.com/global.subcomponent.card-image",
      },
    },
  "https://ds.canonical.com/global.subcomponent.card-image": {
    __id: "https://ds.canonical.com/global.subcomponent.card-image",
    __typename: "Subcomponent",
    uri: "https://ds.canonical.com/global.subcomponent.card-image",
    _meta: {
      __ref:
        "client:https://ds.canonical.com/global.subcomponent.card-image:_meta",
    },
  },
  "client:https://ds.canonical.com/global.subcomponent.card-image:_meta": {
    __id: "client:https://ds.canonical.com/global.subcomponent.card-image:_meta",
    __typename: "EntityMeta",
    title: "Card.Image",
    curie: "ds:global.subcomponent.card-image",
    type: {
      __ref: "https://ds.canonical.com/Subcomponent",
    },
  },
  "client:https://ds.canonical.com/global.component.card:subcomponents(first:24):edges:4":
    {
      __id: "client:https://ds.canonical.com/global.component.card:subcomponents(first:24):edges:4",
      __typename: "SubcomponentEdge",
      node: {
        __ref: "https://ds.canonical.com/global.subcomponent.card-thumbnail",
      },
    },
  "https://ds.canonical.com/global.subcomponent.card-thumbnail": {
    __id: "https://ds.canonical.com/global.subcomponent.card-thumbnail",
    __typename: "Subcomponent",
    uri: "https://ds.canonical.com/global.subcomponent.card-thumbnail",
    _meta: {
      __ref:
        "client:https://ds.canonical.com/global.subcomponent.card-thumbnail:_meta",
    },
  },
  "client:https://ds.canonical.com/global.subcomponent.card-thumbnail:_meta": {
    __id: "client:https://ds.canonical.com/global.subcomponent.card-thumbnail:_meta",
    __typename: "EntityMeta",
    title: "Card.Thumbnail",
    curie: "ds:global.subcomponent.card-thumbnail",
    type: {
      __ref: "https://ds.canonical.com/Subcomponent",
    },
  },
  "client:https://ds.canonical.com/global.component.card:modifierFamilies(first:24)":
    {
      __id: "client:https://ds.canonical.com/global.component.card:modifierFamilies(first:24)",
      __typename: "ModifierFamilyConnection",
      edges: {
        __refs: [],
      },
    },
} as unknown as RecordMap;

export default componentEntityRecordsCard;
