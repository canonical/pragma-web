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
    tokenBindings: {
      __refs: [
        "client:https://ds.canonical.com/global.component.card:tokenBindings:0",
        "client:https://ds.canonical.com/global.component.card:tokenBindings:1",
        "client:https://ds.canonical.com/global.component.card:tokenBindings:2",
        "client:https://ds.canonical.com/global.component.card:tokenBindings:3",
        "client:https://ds.canonical.com/global.component.card:tokenBindings:4",
        "client:https://ds.canonical.com/global.component.card:tokenBindings:5",
        "client:https://ds.canonical.com/global.component.card:tokenBindings:6",
        "client:https://ds.canonical.com/global.component.card:tokenBindings:7",
        "client:https://ds.canonical.com/global.component.card:tokenBindings:8",
        "client:https://ds.canonical.com/global.component.card:tokenBindings:9",
        "client:https://ds.canonical.com/global.component.card:tokenBindings:10",
        "client:https://ds.canonical.com/global.component.card:tokenBindings:11",
        "client:https://ds.canonical.com/global.component.card:tokenBindings:12",
        "client:https://ds.canonical.com/global.component.card:tokenBindings:13",
        "client:https://ds.canonical.com/global.component.card:tokenBindings:14",
        "client:https://ds.canonical.com/global.component.card:tokenBindings:15",
        "client:https://ds.canonical.com/global.component.card:tokenBindings:16",
        "client:https://ds.canonical.com/global.component.card:tokenBindings:17",
      ],
    },
    name: "Card",
    uri: "https://ds.canonical.com/global.component.card",
    usage:
      'Cards are intended for use in "collection-based" views. They are suitable for grids and galleries where multiple data objects of the same type are displayed next to each other. \n\n### When to use\n\n- When you have a repeating data structure with a uniform set of attributes that requires high legibility across many instances.\n- When the container itself acts as a toggle or a checkbox for selecting an item from a group. (radio card) // should be linking to forms\n- When the user behavior is focused on exploration of options, rather than searching for an already identified item of the group. Cards facilitate consuming the information of an individual data object, in contrast with a table where the emphasis is on comparison and ability to scan. \n- When building a responsive table, on small viewports, the designer can choose between horizontal scroll, or converting table rows into cards. \n\n### When not to use\n\n- When a single piece of information is being highlighted on a page without any "peers".\n  - Incorrect: A single card floating in the middle of a dashboard to show "Total users".\n  - Remediation: Use a [Tile](https://docs.superhuman.com/d/_dNyzE_TLZDh#_tugrid-20dWwIHYhx/_rui-eThhoLZg3Y) component designed for individual metric display.\n- When the user needs to perform deep data analysis or multi-column sorting on regular size pages.\n  - Incorrect: Forcing 50 columns of data into a small card format.\n  - Remediation: Use a [Table](https://docs.superhuman.com/d/_dNyzE_TLZDh#_tugrid-20dWwIHYhx/_rui-Olq5LYSopF) to allow for better horizontal scanning and sorting of specific values.',
    guidelines:
      "Styling\n\nhttps://www.figma.com/design/WGHcOmGMEUF9hMAEoRafL8/%F0%9F%93%95-Pragma---documentation-visuals?node-id=2124-397&t=ch8BFFPUe9gCvMdg-1",
    changeLogs: {
      __refs: [
        "client:https://ds.canonical.com/global.component.card:changeLogs:0",
        "client:https://ds.canonical.com/global.component.card:changeLogs:1",
        "client:https://ds.canonical.com/global.component.card:changeLogs:2",
        "client:https://ds.canonical.com/global.component.card:changeLogs:3",
      ],
    },
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
    fields: {
      __refs: [
        "client:https://ds.canonical.com/global.component.card:_meta:fields:0",
        "client:https://ds.canonical.com/global.component.card:_meta:fields:1",
        "client:https://ds.canonical.com/global.component.card:_meta:fields:2",
        "client:https://ds.canonical.com/global.component.card:_meta:fields:3",
        "client:https://ds.canonical.com/global.component.card:_meta:fields:4",
        "client:https://ds.canonical.com/global.component.card:_meta:fields:5",
        "client:https://ds.canonical.com/global.component.card:_meta:fields:6",
        "client:https://ds.canonical.com/global.component.card:_meta:fields:7",
        "client:https://ds.canonical.com/global.component.card:_meta:fields:8",
        "client:https://ds.canonical.com/global.component.card:_meta:fields:9",
        "client:https://ds.canonical.com/global.component.card:_meta:fields:10",
        "client:https://ds.canonical.com/global.component.card:_meta:fields:11",
        "client:https://ds.canonical.com/global.component.card:_meta:fields:12",
        "client:https://ds.canonical.com/global.component.card:_meta:fields:13",
        "client:https://ds.canonical.com/global.component.card:_meta:fields:14",
        "client:https://ds.canonical.com/global.component.card:_meta:fields:15",
        "client:https://ds.canonical.com/global.component.card:_meta:fields:16",
        "client:https://ds.canonical.com/global.component.card:_meta:fields:17",
        "client:https://ds.canonical.com/global.component.card:_meta:fields:18",
        "client:https://ds.canonical.com/global.component.card:_meta:fields:19",
      ],
    },
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
  "client:https://ds.canonical.com/global.component.card:_meta:fields:0": {
    __id: "client:https://ds.canonical.com/global.component.card:_meta:fields:0",
    __typename: "ClassProperty",
    name: "subcomponents",
    order: 5,
    group: { __ref: "https://ds.canonical.com/section.relations" },
  },
  "https://ds.canonical.com/section.relations": {
    __id: "https://ds.canonical.com/section.relations",
    __typename: "PropertyGroup",
    order: 6,
    uri: "https://ds.canonical.com/section.relations",
  },
  "client:https://ds.canonical.com/global.component.card:_meta:fields:1": {
    __id: "client:https://ds.canonical.com/global.component.card:_meta:fields:1",
    __typename: "ClassProperty",
    name: "tokenBindings",
    order: 2,
    group: { __ref: "https://ds.canonical.com/section.api" },
  },
  "https://ds.canonical.com/section.anatomy": {
    __id: "https://ds.canonical.com/section.anatomy",
    __typename: "PropertyGroup",
    order: 4,
    uri: "https://ds.canonical.com/section.anatomy",
  },
  "client:https://ds.canonical.com/global.component.card:_meta:fields:2": {
    __id: "client:https://ds.canonical.com/global.component.card:_meta:fields:2",
    __typename: "ClassProperty",
    name: "variants",
    order: 4,
    group: { __ref: "https://ds.canonical.com/section.relations" },
  },
  "client:https://ds.canonical.com/global.component.card:_meta:fields:3": {
    __id: "client:https://ds.canonical.com/global.component.card:_meta:fields:3",
    __typename: "ClassProperty",
    name: "variantOfs",
    order: 3,
    group: { __ref: "https://ds.canonical.com/section.relations" },
  },
  "client:https://ds.canonical.com/global.component.card:_meta:fields:4": {
    __id: "client:https://ds.canonical.com/global.component.card:_meta:fields:4",
    __typename: "ClassProperty",
    name: "specializedBies",
    order: 2,
    group: { __ref: "https://ds.canonical.com/section.relations" },
  },
  "client:https://ds.canonical.com/global.component.card:_meta:fields:5": {
    __id: "client:https://ds.canonical.com/global.component.card:_meta:fields:5",
    __typename: "ClassProperty",
    name: "inheritsFroms",
    order: 1,
    group: { __ref: "https://ds.canonical.com/section.relations" },
  },
  "client:https://ds.canonical.com/global.component.card:_meta:fields:6": {
    __id: "client:https://ds.canonical.com/global.component.card:_meta:fields:6",
    __typename: "ClassProperty",
    name: "changeLogs",
    order: 1,
    group: { __ref: "https://ds.canonical.com/section.history" },
  },
  "https://ds.canonical.com/section.history": {
    __id: "https://ds.canonical.com/section.history",
    __typename: "PropertyGroup",
    order: 7,
    uri: "https://ds.canonical.com/section.history",
  },
  "client:https://ds.canonical.com/global.component.card:_meta:fields:7": {
    __id: "client:https://ds.canonical.com/global.component.card:_meta:fields:7",
    __typename: "ClassProperty",
    name: "documentationStages",
    order: 4,
    group: { __ref: "https://ds.canonical.com/section.overview" },
  },
  "https://ds.canonical.com/section.overview": {
    __id: "https://ds.canonical.com/section.overview",
    __typename: "PropertyGroup",
    order: 1,
    uri: "https://ds.canonical.com/section.overview",
  },
  "client:https://ds.canonical.com/global.component.card:_meta:fields:8": {
    __id: "client:https://ds.canonical.com/global.component.card:_meta:fields:8",
    __typename: "ClassProperty",
    name: "properties",
    order: 1,
    group: { __ref: "https://ds.canonical.com/section.api" },
  },
  "https://ds.canonical.com/section.api": {
    __id: "https://ds.canonical.com/section.api",
    __typename: "PropertyGroup",
    order: 5,
    uri: "https://ds.canonical.com/section.api",
  },
  "client:https://ds.canonical.com/global.component.card:_meta:fields:9": {
    __id: "client:https://ds.canonical.com/global.component.card:_meta:fields:9",
    __typename: "ClassProperty",
    name: "modifierFamilies",
    order: 1,
    group: { __ref: "https://ds.canonical.com/section.variants" },
  },
  "https://ds.canonical.com/section.variants": {
    __id: "https://ds.canonical.com/section.variants",
    __typename: "PropertyGroup",
    order: 2.5,
    uri: "https://ds.canonical.com/section.variants",
  },
  "client:https://ds.canonical.com/global.component.card:_meta:fields:10": {
    __id: "client:https://ds.canonical.com/global.component.card:_meta:fields:10",
    __typename: "ClassProperty",
    name: "tier",
    order: 3,
    group: { __ref: "https://ds.canonical.com/section.overview" },
  },
  "client:https://ds.canonical.com/global.component.card:_meta:fields:11": {
    __id: "client:https://ds.canonical.com/global.component.card:_meta:fields:11",
    __typename: "ClassProperty",
    name: "guidelines",
    order: 2,
    group: { __ref: "https://ds.canonical.com/section.usage" },
  },
  "https://ds.canonical.com/section.usage": {
    __id: "https://ds.canonical.com/section.usage",
    __typename: "PropertyGroup",
    order: 3,
    uri: "https://ds.canonical.com/section.usage",
  },
  "client:https://ds.canonical.com/global.component.card:_meta:fields:12": {
    __id: "client:https://ds.canonical.com/global.component.card:_meta:fields:12",
    __typename: "ClassProperty",
    name: "usage",
    order: 1,
    group: { __ref: "https://ds.canonical.com/section.usage" },
  },
  "client:https://ds.canonical.com/global.component.card:_meta:fields:13": {
    __id: "client:https://ds.canonical.com/global.component.card:_meta:fields:13",
    __typename: "ClassProperty",
    name: "anatomyDsl",
    order: 1,
    group: { __ref: "https://ds.canonical.com/section.anatomy" },
  },
  "client:https://ds.canonical.com/global.component.card:_meta:fields:14": {
    __id: "client:https://ds.canonical.com/global.component.card:_meta:fields:14",
    __typename: "ClassProperty",
    name: "anatomyClassic",
    order: 2,
    group: { __ref: "https://ds.canonical.com/section.anatomy" },
  },
  "client:https://ds.canonical.com/global.component.card:_meta:fields:15": {
    __id: "client:https://ds.canonical.com/global.component.card:_meta:fields:15",
    __typename: "ClassProperty",
    name: "figmaLink",
    order: 6,
    group: { __ref: "https://ds.canonical.com/section.overview" },
  },
  "client:https://ds.canonical.com/global.component.card:_meta:fields:16": {
    __id: "client:https://ds.canonical.com/global.component.card:_meta:fields:16",
    __typename: "ClassProperty",
    name: "decisionLog",
    order: 2,
    group: { __ref: "https://ds.canonical.com/section.history" },
  },
  "client:https://ds.canonical.com/global.component.card:_meta:fields:17": {
    __id: "client:https://ds.canonical.com/global.component.card:_meta:fields:17",
    __typename: "ClassProperty",
    name: "version",
    order: 5,
    group: { __ref: "https://ds.canonical.com/section.overview" },
  },
  "client:https://ds.canonical.com/global.component.card:_meta:fields:18": {
    __id: "client:https://ds.canonical.com/global.component.card:_meta:fields:18",
    __typename: "ClassProperty",
    name: "summary",
    order: 2,
    group: { __ref: "https://ds.canonical.com/section.overview" },
  },
  "client:https://ds.canonical.com/global.component.card:_meta:fields:19": {
    __id: "client:https://ds.canonical.com/global.component.card:_meta:fields:19",
    __typename: "ClassProperty",
    name: "name",
    order: 1,
    group: { __ref: "https://ds.canonical.com/section.overview" },
  },
  "client:https://ds.canonical.com/global.component.card:changeLogs:0": {
    __id: "client:https://ds.canonical.com/global.component.card:changeLogs:0",
    __typename: "ChangeLogEntry",
    version: null,
    summary: null,
    change:
      "This usage guideline stays in the  general card, until radio cards get separated into their own components: When the container itself acts as a toggle or a checkbox for selecting an item from a group. (radio card) // should be linking to form ",
    changeType: "change",
    timestamp: "2026-04-06T00:00:00.000+02:00",
  },
  "client:https://ds.canonical.com/global.component.card:changeLogs:1": {
    __id: "client:https://ds.canonical.com/global.component.card:changeLogs:1",
    __typename: "ChangeLogEntry",
    version: null,
    summary: null,
    change:
      "open question: in vanilla we had the responsive behavior of tables converting into cards when appropriate. we should have this behavior also for pragma. There should be a linkage between table and data table and cards. Adrian: Would recommend against it for now as it adds complexity (Which tables get turned into cards ? How should responsiveness be enforced ?)\n→ I would recommend adding to the decision log as defered; Diana: This was the design decision - it should be an opt-in responsive behaviour. we can link to “table” and “data table” for more info",
    changeType: "decision",
    timestamp: "2026-04-06T00:00:00.000+02:00",
  },
  "client:https://ds.canonical.com/global.component.card:changeLogs:2": {
    __id: "client:https://ds.canonical.com/global.component.card:changeLogs:2",
    __typename: "ChangeLogEntry",
    version: null,
    summary: null,
    change: "Another test",
    changeType: "change",
    timestamp: "2025-12-08T00:00:00.000+01:00",
  },
  "client:https://ds.canonical.com/global.component.card:changeLogs:3": {
    __id: "client:https://ds.canonical.com/global.component.card:changeLogs:3",
    __typename: "ChangeLogEntry",
    version: null,
    summary: null,
    change: "testing the structure",
    changeType: "change",
    timestamp: "2025-12-05T00:00:00.000+01:00",
  },
  "client:https://ds.canonical.com/global.component.card:tokenBindings:0": {
    __id: "client:https://ds.canonical.com/global.component.card:tokenBindings:0",
    __typename: "TokenBinding",
    node: "$root/global.subcomponent.card-footer",
    consumesSymbol: "https://dt.canonical.com/color.border.muted",
    rank: 1,
  },
  "client:https://ds.canonical.com/global.component.card:tokenBindings:1": {
    __id: "client:https://ds.canonical.com/global.component.card:tokenBindings:1",
    __typename: "TokenBinding",
    node: "$root",
    consumesSymbol: "https://dt.canonical.com/color.border.muted",
    rank: 1,
  },
  "client:https://ds.canonical.com/global.component.card:tokenBindings:2": {
    __id: "client:https://ds.canonical.com/global.component.card:tokenBindings:2",
    __typename: "TokenBinding",
    node: "$root",
    consumesSymbol: "https://dt.canonical.com/dimension.200",
    rank: 1,
  },
  "client:https://ds.canonical.com/global.component.card:tokenBindings:3": {
    __id: "client:https://ds.canonical.com/global.component.card:tokenBindings:3",
    __typename: "TokenBinding",
    node: "$root",
    consumesSymbol: "https://dt.canonical.com/dimension.200",
    rank: 1,
  },
  "client:https://ds.canonical.com/global.component.card:tokenBindings:4": {
    __id: "client:https://ds.canonical.com/global.component.card:tokenBindings:4",
    __typename: "TokenBinding",
    node: "$root",
    consumesSymbol: "https://dt.canonical.com/dimension.200",
    rank: 1,
  },
  "client:https://ds.canonical.com/global.component.card:tokenBindings:5": {
    __id: "client:https://ds.canonical.com/global.component.card:tokenBindings:5",
    __typename: "TokenBinding",
    node: "$root",
    consumesSymbol: "https://dt.canonical.com/dimension.100",
    rank: 1,
  },
  "client:https://ds.canonical.com/global.component.card:tokenBindings:6": {
    __id: "client:https://ds.canonical.com/global.component.card:tokenBindings:6",
    __typename: "TokenBinding",
    node: "$root",
    consumesSymbol: "https://dt.canonical.com/dimension.100",
    rank: 1,
  },
  "client:https://ds.canonical.com/global.component.card:tokenBindings:7": {
    __id: "client:https://ds.canonical.com/global.component.card:tokenBindings:7",
    __typename: "TokenBinding",
    node: "$root/global.subcomponent.card-content",
    consumesSymbol: "https://dt.canonical.com/color.border.muted",
    rank: 1,
  },
  "client:https://ds.canonical.com/global.component.card:tokenBindings:8": {
    __id: "client:https://ds.canonical.com/global.component.card:tokenBindings:8",
    __typename: "TokenBinding",
    node: "$root",
    consumesSymbol: "https://dt.canonical.com/dimension.200",
    rank: 1,
  },
  "client:https://ds.canonical.com/global.component.card:tokenBindings:9": {
    __id: "client:https://ds.canonical.com/global.component.card:tokenBindings:9",
    __typename: "TokenBinding",
    node: "$root",
    consumesSymbol: "https://dt.canonical.com/dimension.200",
    rank: 1,
  },
  "client:https://ds.canonical.com/global.component.card:tokenBindings:10": {
    __id: "client:https://ds.canonical.com/global.component.card:tokenBindings:10",
    __typename: "TokenBinding",
    node: "$root",
    consumesSymbol: "https://dt.canonical.com/dimension.200",
    rank: 1,
  },
  "client:https://ds.canonical.com/global.component.card:tokenBindings:11": {
    __id: "client:https://ds.canonical.com/global.component.card:tokenBindings:11",
    __typename: "TokenBinding",
    node: "$root",
    consumesSymbol: "https://dt.canonical.com/dimension.200",
    rank: 1,
  },
  "client:https://ds.canonical.com/global.component.card:tokenBindings:12": {
    __id: "client:https://ds.canonical.com/global.component.card:tokenBindings:12",
    __typename: "TokenBinding",
    node: "$root",
    consumesSymbol: "https://dt.canonical.com/dimension.200",
    rank: 1,
  },
  "client:https://ds.canonical.com/global.component.card:tokenBindings:13": {
    __id: "client:https://ds.canonical.com/global.component.card:tokenBindings:13",
    __typename: "TokenBinding",
    node: "$root",
    consumesSymbol: "https://dt.canonical.com/color.border.muted",
    rank: 1,
  },
  "client:https://ds.canonical.com/global.component.card:tokenBindings:14": {
    __id: "client:https://ds.canonical.com/global.component.card:tokenBindings:14",
    __typename: "TokenBinding",
    node: "$root/global.subcomponent.card-image",
    consumesSymbol: "https://dt.canonical.com/color.border.muted",
    rank: 1,
  },
  "client:https://ds.canonical.com/global.component.card:tokenBindings:15": {
    __id: "client:https://ds.canonical.com/global.component.card:tokenBindings:15",
    __typename: "TokenBinding",
    node: "$root",
    consumesSymbol: "https://dt.canonical.com/dimension.radius.medium",
    rank: 1,
  },
  "client:https://ds.canonical.com/global.component.card:tokenBindings:16": {
    __id: "client:https://ds.canonical.com/global.component.card:tokenBindings:16",
    __typename: "TokenBinding",
    node: "$root",
    consumesSymbol: "https://dt.canonical.com/color.border.muted",
    rank: 1,
  },
  "client:https://ds.canonical.com/global.component.card:tokenBindings:17": {
    __id: "client:https://ds.canonical.com/global.component.card:tokenBindings:17",
    __typename: "TokenBinding",
    node: "$root",
    consumesSymbol:
      "https://dt.canonical.com/dimension.stroke.thickness.medium",
    rank: 1,
  },
} as unknown as RecordMap;

export default componentEntityRecordsCard;
