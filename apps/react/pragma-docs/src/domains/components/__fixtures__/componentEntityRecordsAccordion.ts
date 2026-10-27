/**
 * A serialised Relay store snapshot for `ComponentEntityQuery` at
 * { uri: "ds:global.component.accordion", count: 24 }: the store the prepare step
 * serialises (`getStore().getSource().toJSON()`) after the operation runs
 * against the graph server, nothing trimmed. Regenerate by booting
 * `graph` and running the operation through `createEnvironment`, or by
 * copying `relay.records` out of the `__INITIAL_DATA__` script served at
 * /components/ds%3Aglobal.component.accordion.
 *
 * The literal is wider than `RecordMap`'s nominal record type (and
 * `RecordMap` isn't root-exported from relay-runtime — hence the deep
 * import) — hence the double cast at the end.
 */

import type { RecordMap } from "relay-runtime/store/RelayStoreTypes.js";

const componentEntityRecordsAccordion = {
  "client:root": {
    __id: "client:root",
    __typename: "__Root",
    'component(uri:"ds:global.component.accordion")': {
      __ref: "https://ds.canonical.com/global.component.accordion",
    },
  },
  "https://ds.canonical.com/global.component.accordion": {
    __id: "https://ds.canonical.com/global.component.accordion",
    __typename: "Component",
    name: "Accordion",
    uri: "https://ds.canonical.com/global.component.accordion",
    _meta: {
      __ref: "client:https://ds.canonical.com/global.component.accordion:_meta",
    },
    summary:
      "The accordion is a vertically stacked content area which can be collapsed and expanded to reveal or hide its contents. An  can be opened or closed independently of its surrounding counterparts (i.e: multiple accordions can be open at the same time). \n\nAccordions can help browse different pieces of related content in a more efficient way. Be wary that they can also hide content from users and are not suitable when a user is meant to read all of the page content.\n\n",
    version: null,
    tier: {
      __ref: "https://ds.canonical.com/global",
    },
    "documentationStages(first:1)": {
      __ref:
        "client:https://ds.canonical.com/global.component.accordion:documentationStages(first:1)",
    },
    anatomyDsl:
      '---\n# Authored 2026-09-13 from @canonical/react-ds-global src/lib/component/Accordion/styles.css on .ds.accordion\nnode:\n  uri: global.component.accordion\n  styles:\n    layout.type: flex\n    layout.direction: column\n    # Inert outside a grid: the accordion is a full-width block, never a cell.\n    layout.grid.column: "1 / -1"\n    # Read on the element, not at :root, so the surface channel steps with\n    # `.surface` nesting; outside any surface it falls back to the base.\n    appearance.background: [surface.color.background, color.background]\n    appearance.radius: dimension.radius.small\n    # Clips the item corners to the accordion radius.\n    layout.overflow: hidden\n    # The retired `appearance.border: color-border-$root` is dropped: per the\n    # Figma anatomy the accordion has no outer frame — only the per-item\n    # dividers, which Accordion.Item carries.\n  edges:\n    - node:\n        uri: global.subcomponent.accordion-item\n      relation:\n        cardinality: "1..*"\n        slotName: default',
    properties: {
      __refs: [
        "client:https://ds.canonical.com/global.component.accordion:properties:0",
        "client:https://ds.canonical.com/global.component.accordion:properties:1",
        "client:https://ds.canonical.com/global.component.accordion:properties:2",
        "client:https://ds.canonical.com/global.component.accordion:properties:3",
        "client:https://ds.canonical.com/global.component.accordion:properties:4",
        "client:https://ds.canonical.com/global.component.accordion:properties:5",
        "client:https://ds.canonical.com/global.component.accordion:properties:6",
      ],
    },
    "inheritsFroms(first:24)": {
      __ref:
        "client:https://ds.canonical.com/global.component.accordion:inheritsFroms(first:24)",
    },
    "specializedBies(first:24)": {
      __ref:
        "client:https://ds.canonical.com/global.component.accordion:specializedBies(first:24)",
    },
    "variants(first:24)": {
      __ref:
        "client:https://ds.canonical.com/global.component.accordion:variants(first:24)",
    },
    "variantOfs(first:24)": {
      __ref:
        "client:https://ds.canonical.com/global.component.accordion:variantOfs(first:24)",
    },
    "subcomponents(first:24)": {
      __ref:
        "client:https://ds.canonical.com/global.component.accordion:subcomponents(first:24)",
    },
    "modifierFamilies(first:24)": {
      __ref:
        "client:https://ds.canonical.com/global.component.accordion:modifierFamilies(first:24)",
    },
  },
  "client:https://ds.canonical.com/global.component.accordion:_meta": {
    __id: "client:https://ds.canonical.com/global.component.accordion:_meta",
    __typename: "EntityMeta",
    curie: "ds:global.component.accordion",
  },
  "https://ds.canonical.com/global": {
    __id: "https://ds.canonical.com/global",
    __typename: "Tier",
    name: "Global",
    uri: "https://ds.canonical.com/global",
  },
  "client:https://ds.canonical.com/global.component.accordion:documentationStages(first:1)":
    {
      __id: "client:https://ds.canonical.com/global.component.accordion:documentationStages(first:1)",
      __typename: "TagConnection",
      edges: {
        __refs: [
          "client:https://ds.canonical.com/global.component.accordion:documentationStages(first:1):edges:0",
        ],
      },
    },
  "client:https://ds.canonical.com/global.component.accordion:documentationStages(first:1):edges:0":
    {
      __id: "client:https://ds.canonical.com/global.component.accordion:documentationStages(first:1):edges:0",
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
  "client:https://ds.canonical.com/global.component.accordion:properties:0": {
    __id: "client:https://ds.canonical.com/global.component.accordion:properties:0",
    __typename: "Property",
    name: "heading level",
    propertyType: "choice",
    optional: false,
    defaultValue: null,
    constraints: null,
    summary:
      "Establishes the heading level of the accordion headings, depending on the page structure",
  },
  "client:https://ds.canonical.com/global.component.accordion:properties:1": {
    __id: "client:https://ds.canonical.com/global.component.accordion:properties:1",
    __typename: "Property",
    name: "content",
    propertyType: "element",
    optional: false,
    defaultValue: null,
    constraints: null,
    summary:
      "The content property sets the content that is being shown in the content area of the accordion. The content can be set to any content that the designer / developer wants to show. It is not allowed to nest accordions in the content section. By default the content section contains just a text element.",
  },
  "client:https://ds.canonical.com/global.component.accordion:properties:2": {
    __id: "client:https://ds.canonical.com/global.component.accordion:properties:2",
    __typename: "Property",
    name: "state",
    propertyType: "choice",
    optional: false,
    defaultValue: "default",
    constraints: null,
    summary:
      "The heading style property changes the styling of the heading of an accordion item.",
  },
  "client:https://ds.canonical.com/global.component.accordion:properties:3": {
    __id: "client:https://ds.canonical.com/global.component.accordion:properties:3",
    __typename: "Property",
    name: "heading style",
    propertyType: "choice",
    optional: true,
    defaultValue: "default",
    constraints: null,
    summary:
      "The heading style property changes the styling of the heading of an accordion item.",
  },
  "client:https://ds.canonical.com/global.component.accordion:properties:4": {
    __id: "client:https://ds.canonical.com/global.component.accordion:properties:4",
    __typename: "Property",
    name: "heading",
    propertyType: "text",
    optional: false,
    defaultValue: null,
    constraints: null,
    summary:
      "The heading property controls the text content of the accordion item heading and can be freely set by the designer / developer.",
  },
  "client:https://ds.canonical.com/global.component.accordion:properties:5": {
    __id: "client:https://ds.canonical.com/global.component.accordion:properties:5",
    __typename: "Property",
    name: "expanded",
    propertyType: "boolean",
    optional: true,
    defaultValue: "false",
    constraints: null,
    summary:
      "The expanded property controls wether an accordion item is opened or closed.",
  },
  "client:https://ds.canonical.com/global.component.accordion:properties:6": {
    __id: "client:https://ds.canonical.com/global.component.accordion:properties:6",
    __typename: "Property",
    name: "children",
    propertyType: "node",
    optional: false,
    defaultValue: null,
    constraints: null,
    summary: null,
  },
  "client:https://ds.canonical.com/global.component.accordion:inheritsFroms(first:24)":
    {
      __id: "client:https://ds.canonical.com/global.component.accordion:inheritsFroms(first:24)",
      __typename: "UIBlockConnection",
      edges: {
        __refs: [],
      },
    },
  "client:https://ds.canonical.com/global.component.accordion:specializedBies(first:24)":
    {
      __id: "client:https://ds.canonical.com/global.component.accordion:specializedBies(first:24)",
      __typename: "UIBlockConnection",
      edges: {
        __refs: [],
      },
    },
  "client:https://ds.canonical.com/global.component.accordion:variants(first:24)":
    {
      __id: "client:https://ds.canonical.com/global.component.accordion:variants(first:24)",
      __typename: "UIBlockConnection",
      edges: {
        __refs: [],
      },
    },
  "client:https://ds.canonical.com/global.component.accordion:variantOfs(first:24)":
    {
      __id: "client:https://ds.canonical.com/global.component.accordion:variantOfs(first:24)",
      __typename: "UIBlockConnection",
      edges: {
        __refs: [],
      },
    },
  "client:https://ds.canonical.com/global.component.accordion:subcomponents(first:24)":
    {
      __id: "client:https://ds.canonical.com/global.component.accordion:subcomponents(first:24)",
      __typename: "SubcomponentConnection",
      edges: {
        __refs: [
          "client:https://ds.canonical.com/global.component.accordion:subcomponents(first:24):edges:0",
        ],
      },
    },
  "client:https://ds.canonical.com/global.component.accordion:subcomponents(first:24):edges:0":
    {
      __id: "client:https://ds.canonical.com/global.component.accordion:subcomponents(first:24):edges:0",
      __typename: "SubcomponentEdge",
      node: {
        __ref: "https://ds.canonical.com/global.subcomponent.accordion-item",
      },
    },
  "https://ds.canonical.com/global.subcomponent.accordion-item": {
    __id: "https://ds.canonical.com/global.subcomponent.accordion-item",
    __typename: "Subcomponent",
    uri: "https://ds.canonical.com/global.subcomponent.accordion-item",
    _meta: {
      __ref:
        "client:https://ds.canonical.com/global.subcomponent.accordion-item:_meta",
    },
  },
  "client:__type:Subcomponent": {
    __id: "client:__type:Subcomponent",
    __typename: "__TypeSchema",
    __isNode: true,
  },
  "client:https://ds.canonical.com/global.subcomponent.accordion-item:_meta": {
    __id: "client:https://ds.canonical.com/global.subcomponent.accordion-item:_meta",
    __typename: "EntityMeta",
    title: "Accordion.Item",
    curie: "ds:global.subcomponent.accordion-item",
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
  "client:https://ds.canonical.com/global.component.accordion:modifierFamilies(first:24)":
    {
      __id: "client:https://ds.canonical.com/global.component.accordion:modifierFamilies(first:24)",
      __typename: "ModifierFamilyConnection",
      edges: {
        __refs: [],
      },
    },
} as unknown as RecordMap;

export default componentEntityRecordsAccordion;
