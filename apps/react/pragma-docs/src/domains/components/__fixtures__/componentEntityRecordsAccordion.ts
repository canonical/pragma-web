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
    usage:
      "The accordion can be used to pack a lot of content into a constrained space by allowing to collapse and expand the  to show or hide its contents. It also allows the user to consume the contents at their own pace and preference by not immediately showing but relying on progressive disclosure instead.\n\nTherefore when used right, accordions can help browse different pieces of related content in a more efficient way. Be wary that they can also hide content from users and are not suitable when a user is meant to read all of the page content.\n\n### Header\n\nThe header of the content contains the chevron, heading, and optional items such as a [Badge](https://docs.superhuman.com/d/_dNyzE_TLZDh#_tugrid-20dWwIHYhx/_rui-eHpgyzRyDl). The heading of the accordion should give the user a clear indication of what the contents of accordion item are going to be. The user should not have to open the   to understand what is contained inside of it.\n\n### Panel\n\nThe accordion panel is what contains the content of an  . Be mindful of what contents are put in the accordion item as an accordion does not lend itself well to containing overly complex components or patterns. The contents of an accordion will most often be just plain text or a simple component arrangement like filters (checkbox + label).\n\nIt is not allowed to nest  .\n\n### When to use\n\n- In cases where there is a lot more content than the available screen estate allows for. E.g. when there is a lot of filters to show in a sidebar.\n- When you want to allow the user to scan large amounts of contents in a smaller amount of space and dive deeper at their own choosing. E.g. in an FAQ.\n- To shorten page lengths (and scroll time) if it is not important that the user reads everything.\n\n### When not to use\n\n- When the page content must be seen at a glance by a user. \n  - Incorrect: Hiding mandatory legal terms or essential safety instructions inside collapsed Accordion panels.\n  - Remediation: Instead you might consider restructuring your content or using anchor links in the beginning of the page which redirect the user to specific sections of the page. \n- When the data you want to show is inherently nested as accordion items do not allow to be nested.\n  - Incorrect: Using an accordion to house a four-level deep directory of help articles or internal pages.\n  - Remediation: Use a side [Navigation](https://docs.superhuman.com/d/_dNyzE_TLZDh#_tugrid-20dWwIHYhx/_rui-nkDiZdUMkV) or [FileTree](https://docs.superhuman.com/d/_dNyzE_TLZDh#_tugrid-20dWwIHYhx/_rui-DAHwqGVhxp)  component, which is specifically designed to handle nested relationships and persistent state across navigation.  \n",
    guidelines:
      '# Animation\n\nThere is a fast (0.165s) animation of the accordion item when an accordion item is expanded / collapsed.\n\n- A fade from 0 - 100% opacity\n- The content slides upwards/downwards slightly (0.5rem)\n\n# Accessibility\n\n## Built-in\n\n### Semantic foundation: HTML and Aria labels\n\n- The accordion header is an HTML button.\n- The button which expands the accordion item has `aria-expanded=”true”` label if the accordion item is currently expanded, and `aria-expanded="false"` when it is collapsed.\n- The button which expands the accordion item has a `aria-controls` with the ID set to the ID of the panel which is being expanded by it.\n- The accordion panel uses the `aria-labelledby` label with the ID set to the ID of the button which expands the accordion item.\n- Each accordion header button is automatically wrapped in a heading element at the level specified by the required `headingLevel` prop.\n\n### Visual and motion\n\n- Text color ensures 4.5:1 contrast with the background, chevrons color ensure 3:1 contrast with the background\n- Animations are disabled when `prefers-reduced-motion: reduce` is set\n- Color alone is not and should not be used to distinguish expanded vs. collapsed state. The chevron direction change indicates the difference.\n\n### **Keyboard navigation and focus order** \n\n- `Tab` and `Shift-Tab` are used to navigate forward and backward through each accordion header and all focusable elements in the accordion should be included in the tab order.\n- `Enter` or `Space` expand and collapse each accordion panel. \n- Expanding a panel does not move keyboard focus, it stays on the header button. The user presses `Tab` to move focus to the first focusable element inside the panel, if any, or to move to the next header. \n- `Home` / `End` move focus to the first / last accordion header\n\n### Screen reader & assistive technology support\n\n- When a collapsed accordion header receives focus, a screen reader announces the button label, its role (button), and its state (”collapsed” or “expanded”)\n- When the user activates the button, the state change is announced immediately via the updated `aria-expanded` value\n- The expanded panel content is not automatically read. Expanding a panel does not move keyboard focus, it stays on the header button. The user presses Tab to move focus to the first focusable element inside the panel. Screen reader users can additionally navigate panel content using their virtual cursor (browse mode) without pressing Tab.\n\n## Consumer responsibilities\n\n### Semantic foundation: HTML and Aria labels\n\n- The accordion item heading should have an appropriate `aria-level` label, depending on its position in the hierarchy of the page.\n- Each accordion heading must have a unique and descriptive content. Vague content like “Read more” is inaccessible: the heading is all a screen reader user has to orient by when navigating.\n\n### Visual and motion \n\n- Ensure all items placed inside the accordion panel respect color contrast requirements.\n\n### **Keyboard navigation and focus order** \n\n- Avoid keyboard traps when adding components to the accordion panel. For example, the user expands an accordion, but is unable to tab to the next focusable element. \n- You can add a `Down Arrow` / `Up Arrow` option to move focus between accordion headers for accordion-heavy pages.\n\n### Screen reader & assistive technology support\n\n- Avoid placing deeply nested interactive components (nested accordions, complex forms) inside accordion panels without testing the full tab flow with a screen reader.\n\n\n\n## **Accessibility resources**\n\n- [W3C WAI-ARIA Accordion (Sections With Show/Hide Functionality)](https://www.w3.org/WAI/ARIA/apg/patterns/accordion/)\n- [WAI-ARIA Examples: Accordion](https://www.w3.org/WAI/ARIA/apg/patterns/accordion/examples/accordion/)\n- [Carbon design systems - Accordion accessibility](https://carbondesignsystem.com/components/accordion/accessibility)\n- Guidelines:\n  - [1.3.1: Info and Relationships](https://www.w3.org/TR/WCAG22/#info-and-relationships)\n  - [2.1.1: Keyboard](https://www.w3.org/TR/WCAG22/#keyboard)\n  - [2.1.2: No Keyboard Trap](https://www.w3.org/TR/WCAG22/#no-keyboard-trap)\n\n\n\n## **References**\n\n- [https://github.com/alphagov/govuk-design-system-backlog/issues/1#issuecomment-995675898](https://github.com/alphagov/govuk-design-system-backlog/issues/1#issuecomment-995675898)\n- [https://www.nngroup.com/articles/accordions-complex-content/](https://www.nngroup.com/articles/accordions-complex-content/)\n- [https://www.smashingmagazine.com/2017/06/designing-perfect-accordion-checklist/](https://www.smashingmagazine.com/2017/06/designing-perfect-accordion-checklist/)',
    changeLogs: {
      __refs: [
        "client:https://ds.canonical.com/global.component.accordion:changeLogs:0",
        "client:https://ds.canonical.com/global.component.accordion:changeLogs:1",
        "client:https://ds.canonical.com/global.component.accordion:changeLogs:2",
      ],
    },
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
    fields: {
      __refs: [
        "client:https://ds.canonical.com/global.component.accordion:_meta:fields:0",
        "client:https://ds.canonical.com/global.component.accordion:_meta:fields:1",
        "client:https://ds.canonical.com/global.component.accordion:_meta:fields:2",
        "client:https://ds.canonical.com/global.component.accordion:_meta:fields:3",
        "client:https://ds.canonical.com/global.component.accordion:_meta:fields:4",
        "client:https://ds.canonical.com/global.component.accordion:_meta:fields:5",
        "client:https://ds.canonical.com/global.component.accordion:_meta:fields:6",
        "client:https://ds.canonical.com/global.component.accordion:_meta:fields:7",
        "client:https://ds.canonical.com/global.component.accordion:_meta:fields:8",
        "client:https://ds.canonical.com/global.component.accordion:_meta:fields:9",
        "client:https://ds.canonical.com/global.component.accordion:_meta:fields:10",
        "client:https://ds.canonical.com/global.component.accordion:_meta:fields:11",
        "client:https://ds.canonical.com/global.component.accordion:_meta:fields:12",
        "client:https://ds.canonical.com/global.component.accordion:_meta:fields:13",
        "client:https://ds.canonical.com/global.component.accordion:_meta:fields:14",
        "client:https://ds.canonical.com/global.component.accordion:_meta:fields:15",
        "client:https://ds.canonical.com/global.component.accordion:_meta:fields:16",
        "client:https://ds.canonical.com/global.component.accordion:_meta:fields:17",
        "client:https://ds.canonical.com/global.component.accordion:_meta:fields:18",
        "client:https://ds.canonical.com/global.component.accordion:_meta:fields:19",
      ],
    },
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
  "client:https://ds.canonical.com/global.component.accordion:_meta:fields:0": {
    __id: "client:https://ds.canonical.com/global.component.accordion:_meta:fields:0",
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
  "client:https://ds.canonical.com/global.component.accordion:_meta:fields:1": {
    __id: "client:https://ds.canonical.com/global.component.accordion:_meta:fields:1",
    __typename: "ClassProperty",
    name: "tokenBindings",
    order: 3,
    group: { __ref: "https://ds.canonical.com/section.anatomy" },
  },
  "https://ds.canonical.com/section.anatomy": {
    __id: "https://ds.canonical.com/section.anatomy",
    __typename: "PropertyGroup",
    order: 4,
    uri: "https://ds.canonical.com/section.anatomy",
  },
  "client:https://ds.canonical.com/global.component.accordion:_meta:fields:2": {
    __id: "client:https://ds.canonical.com/global.component.accordion:_meta:fields:2",
    __typename: "ClassProperty",
    name: "variants",
    order: 4,
    group: { __ref: "https://ds.canonical.com/section.relations" },
  },
  "client:https://ds.canonical.com/global.component.accordion:_meta:fields:3": {
    __id: "client:https://ds.canonical.com/global.component.accordion:_meta:fields:3",
    __typename: "ClassProperty",
    name: "variantOfs",
    order: 3,
    group: { __ref: "https://ds.canonical.com/section.relations" },
  },
  "client:https://ds.canonical.com/global.component.accordion:_meta:fields:4": {
    __id: "client:https://ds.canonical.com/global.component.accordion:_meta:fields:4",
    __typename: "ClassProperty",
    name: "specializedBies",
    order: 2,
    group: { __ref: "https://ds.canonical.com/section.relations" },
  },
  "client:https://ds.canonical.com/global.component.accordion:_meta:fields:5": {
    __id: "client:https://ds.canonical.com/global.component.accordion:_meta:fields:5",
    __typename: "ClassProperty",
    name: "inheritsFroms",
    order: 1,
    group: { __ref: "https://ds.canonical.com/section.relations" },
  },
  "client:https://ds.canonical.com/global.component.accordion:_meta:fields:6": {
    __id: "client:https://ds.canonical.com/global.component.accordion:_meta:fields:6",
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
  "client:https://ds.canonical.com/global.component.accordion:_meta:fields:7": {
    __id: "client:https://ds.canonical.com/global.component.accordion:_meta:fields:7",
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
  "client:https://ds.canonical.com/global.component.accordion:_meta:fields:8": {
    __id: "client:https://ds.canonical.com/global.component.accordion:_meta:fields:8",
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
  "client:https://ds.canonical.com/global.component.accordion:_meta:fields:9": {
    __id: "client:https://ds.canonical.com/global.component.accordion:_meta:fields:9",
    __typename: "ClassProperty",
    name: "modifierFamilies",
    order: 2,
    group: { __ref: "https://ds.canonical.com/section.api" },
  },
  "client:https://ds.canonical.com/global.component.accordion:_meta:fields:10":
    {
      __id: "client:https://ds.canonical.com/global.component.accordion:_meta:fields:10",
      __typename: "ClassProperty",
      name: "tier",
      order: 3,
      group: { __ref: "https://ds.canonical.com/section.overview" },
    },
  "client:https://ds.canonical.com/global.component.accordion:_meta:fields:11":
    {
      __id: "client:https://ds.canonical.com/global.component.accordion:_meta:fields:11",
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
  "client:https://ds.canonical.com/global.component.accordion:_meta:fields:12":
    {
      __id: "client:https://ds.canonical.com/global.component.accordion:_meta:fields:12",
      __typename: "ClassProperty",
      name: "usage",
      order: 1,
      group: { __ref: "https://ds.canonical.com/section.usage" },
    },
  "client:https://ds.canonical.com/global.component.accordion:_meta:fields:13":
    {
      __id: "client:https://ds.canonical.com/global.component.accordion:_meta:fields:13",
      __typename: "ClassProperty",
      name: "anatomyDsl",
      order: 1,
      group: { __ref: "https://ds.canonical.com/section.anatomy" },
    },
  "client:https://ds.canonical.com/global.component.accordion:_meta:fields:14":
    {
      __id: "client:https://ds.canonical.com/global.component.accordion:_meta:fields:14",
      __typename: "ClassProperty",
      name: "anatomyClassic",
      order: 2,
      group: { __ref: "https://ds.canonical.com/section.anatomy" },
    },
  "client:https://ds.canonical.com/global.component.accordion:_meta:fields:15":
    {
      __id: "client:https://ds.canonical.com/global.component.accordion:_meta:fields:15",
      __typename: "ClassProperty",
      name: "figmaLink",
      order: 6,
      group: { __ref: "https://ds.canonical.com/section.overview" },
    },
  "client:https://ds.canonical.com/global.component.accordion:_meta:fields:16":
    {
      __id: "client:https://ds.canonical.com/global.component.accordion:_meta:fields:16",
      __typename: "ClassProperty",
      name: "decisionLog",
      order: 2,
      group: { __ref: "https://ds.canonical.com/section.history" },
    },
  "client:https://ds.canonical.com/global.component.accordion:_meta:fields:17":
    {
      __id: "client:https://ds.canonical.com/global.component.accordion:_meta:fields:17",
      __typename: "ClassProperty",
      name: "version",
      order: 5,
      group: { __ref: "https://ds.canonical.com/section.overview" },
    },
  "client:https://ds.canonical.com/global.component.accordion:_meta:fields:18":
    {
      __id: "client:https://ds.canonical.com/global.component.accordion:_meta:fields:18",
      __typename: "ClassProperty",
      name: "summary",
      order: 2,
      group: { __ref: "https://ds.canonical.com/section.overview" },
    },
  "client:https://ds.canonical.com/global.component.accordion:_meta:fields:19":
    {
      __id: "client:https://ds.canonical.com/global.component.accordion:_meta:fields:19",
      __typename: "ClassProperty",
      name: "name",
      order: 1,
      group: { __ref: "https://ds.canonical.com/section.overview" },
    },
  "client:https://ds.canonical.com/global.component.accordion:changeLogs:0": {
    __id: "client:https://ds.canonical.com/global.component.accordion:changeLogs:0",
    __typename: "ChangeLogEntry",
    version: null,
    summary: null,
    change: "Added accessibility guidelines",
    changeType: "change",
    timestamp: "2026-06-26T00:00:00.000+02:00",
  },
  "client:https://ds.canonical.com/global.component.accordion:changeLogs:1": {
    __id: "client:https://ds.canonical.com/global.component.accordion:changeLogs:1",
    __typename: "ChangeLogEntry",
    version: null,
    summary: null,
    change: "Added properties",
    changeType: "change",
    timestamp: "2026-06-10T00:00:00.000+02:00",
  },
  "client:https://ds.canonical.com/global.component.accordion:changeLogs:2": {
    __id: "client:https://ds.canonical.com/global.component.accordion:changeLogs:2",
    __typename: "ChangeLogEntry",
    version: null,
    summary: null,
    change: null,
    changeType: "change",
    timestamp: "2026-01-21T14:13:23.000+01:00",
  },
} as unknown as RecordMap;

export default componentEntityRecordsAccordion;
