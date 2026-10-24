/**
 * A serialised Relay store snapshot for `ComponentEntityQuery` at
 * { uri: "ds:global.component.button", count: 24 }: the store the prepare step
 * serialises (`getStore().getSource().toJSON()`) after the operation runs
 * against the graph server, nothing trimmed. Regenerate by booting
 * `graph` and running the operation through `createEnvironment`, or by
 * copying `relay.records` out of the `__INITIAL_DATA__` script served at
 * /components/ds%3Aglobal.component.button.
 *
 * The literal is wider than `RecordMap`'s nominal record type (and
 * `RecordMap` isn't root-exported from relay-runtime — hence the deep
 * import) — hence the double cast at the end.
 */

import type { RecordMap } from "relay-runtime/store/RelayStoreTypes.js";

const componentEntityRecordsButton = {
  "client:root": {
    __id: "client:root",
    __typename: "__Root",
    'component(uri:"ds:global.component.button")': {
      __ref: "https://ds.canonical.com/global.component.button",
    },
  },
  "https://ds.canonical.com/global.component.button": {
    __id: "https://ds.canonical.com/global.component.button",
    __typename: "Component",
    name: "Button",
    uri: "https://ds.canonical.com/global.component.button",
    _meta: {
      __ref: "client:https://ds.canonical.com/global.component.button:_meta",
    },
    summary:
      "Buttons trigger actions within an interface, typically involving data transformation or manipulation. They provide clear visual indicators of the primary actions users can perform on a page or section.\n\n",
    version: null,
    tier: {
      __ref: "https://ds.canonical.com/global",
    },
    "documentationStages(first:1)": {
      __ref:
        "client:https://ds.canonical.com/global.component.button:documentationStages(first:1)",
    },
    anatomyDsl:
      '---\n# Authored 2026-09-13 from @canonical/react-ds-global src/lib/component/Button/styles.css on .ds.button\n# Every list is the reference\'s own var() chain, in order. The button reads the\n# modifier CHANNEL generically — it knows no particular importance class — so\n# the channel is consumed by name wherever the implementation reads it.\nnode:\n  uri: global.component.button\n  styles:\n    layout.position: relative\n    layout.type: inline-flex\n    layout.align: center\n    layout.justify: center\n    interaction.cursor: pointer\n    interaction.cursor@disabled: not-allowed\n    appearance.border.style: solid\n    appearance.border.width: dimension.stroke.thickness.medium\n    # The primary foreground fills the background, through the channel that\n    # importance provides it on.\n    # reads --modifier-surface first; no symbol declares it.\n    appearance.background: [modifier.color.foreground.primary, color.foreground.primary]\n    # reads --modifier-surface-hover / -active / -disabled first; no symbol\n    # declares any of the three.\n    appearance.background@hover: color.foreground.primary.hover\n    appearance.background@active: color.foreground.primary.active\n    appearance.background@disabled: color.foreground.primary.disabled\n    # The border is always present at the nominal width and colour-mixed to\n    # transparent when the importance hides it; --modifier-outline is the 0/1\n    # flag that does the mixing, and no symbol declares it.\n    appearance.border.color: [modifier.color.border, color.border.highlighted, color.border]\n    # reads --modifier-color-border-disabled first; no symbol declares it.\n    appearance.border.color@disabled: color.border.highlighted.disabled\n    typography.color: [modifier.color.text, color.text]\n    # reads --modifier-color-text-disabled first; no symbol declares it.\n    typography.color@disabled: color.text.disabled\n    typography.weight: typography.weight.medium\n    # The label is the text-secondary tier (14px). The implementation reads\n    # --typography-text-secondary-font-size, whose member carries no symbol of\n    # its own and resolves to --dimension-size-font-size-300 in every context.\n    typography.size: dimension.size.fontSize.300\n    typography.font: typography.text.secondary\n    typography.align: center\n    typography.decoration: none\n    spacing.gap: dimension.100   # --button-gap, between the icon and the label\n    # 16px each side, the action inset the button plays. A leading icon tightens\n    # the start side to --dimension-100, which is a conditional the anatomy does\n    # not carry.\n    spacing.internal.inline.start: dimension.200  # --button-padding-inline-start\n    spacing.internal.inline.end: dimension.200    # --button-padding-inline-end\n    motion.property: "background-color, color, border-color"\n    # The transition reads --motion-duration-fast and --motion-easing-standard;\n    # both bindings are dropped because no symbol declares either name and\n    # neither var() carries a literal fallback.\n    # reads --focus-outline-width first; no symbol declares it, so the chain\'s\n    # own literal is what is left.\n    appearance.outline.width@focus: 2px\n    appearance.outline.style@focus: solid\n    appearance.outline.color@focus: [modifier.color.focusRing, color.focusRing, currentColor]\n    # reads --focus-outline-offset first; no symbol declares it.\n    appearance.outline.offset@focus: 2px\n    # The `.link` variant (transparent chrome, underlined link text) is the\n    # separate ButtonLink block (ds:global.component.button_link), not a case\n    # of this tree.\n  edges:\n    - node:\n        role: icon\n        styles:\n          layout.type: inline-flex\n          layout.align: center\n          layout.alignSelf: center\n          layout.justify: center\n          layout.flex.shrink: 0\n          # reads --icon-size, a component-local size declared as 1em at :root.\n          size.width: 1em\n          size.height: 1em\n          # The icon has its own colour channel, distinct from the label\'s, and\n          # falls through to the colour it inherits.\n          typography.color: [modifier.color.icon, modifier.color.text, currentColor]\n          # reads --modifier-color-icon-disabled first; no symbol declares it.\n          typography.color@disabled: color.icon.disabled\n      relation:\n        cardinality: "0..1"\n        slotName: icon\n    - node:\n        role: label text\n      relation:\n        cardinality: "1"\n        slotName: label\n    - node:\n        role: loading spinner\n        styles:\n          layout.position: absolute\n          layout.type: inline-flex\n          layout.align: center\n          layout.justify: center\n          layout.offset.top: 0\n          layout.offset.right: 0\n          layout.offset.bottom: 0\n          layout.offset.left: 0\n      relation:\n        # Present only while loading, when the icon and the label stay in the\n        # DOM at `visibility: hidden` so the button keeps its width.\n        cardinality: "0..1"',
    properties: {
      __refs: [
        "client:https://ds.canonical.com/global.component.button:properties:0",
        "client:https://ds.canonical.com/global.component.button:properties:1",
        "client:https://ds.canonical.com/global.component.button:properties:2",
        "client:https://ds.canonical.com/global.component.button:properties:3",
        "client:https://ds.canonical.com/global.component.button:properties:4",
      ],
    },
    "inheritsFroms(first:24)": {
      __ref:
        "client:https://ds.canonical.com/global.component.button:inheritsFroms(first:24)",
    },
    "specializedBies(first:24)": {
      __ref:
        "client:https://ds.canonical.com/global.component.button:specializedBies(first:24)",
    },
    "variants(first:24)": {
      __ref:
        "client:https://ds.canonical.com/global.component.button:variants(first:24)",
    },
    "variantOfs(first:24)": {
      __ref:
        "client:https://ds.canonical.com/global.component.button:variantOfs(first:24)",
    },
    "subcomponents(first:24)": {
      __ref:
        "client:https://ds.canonical.com/global.component.button:subcomponents(first:24)",
    },
    "modifierFamilies(first:24)": {
      __ref:
        "client:https://ds.canonical.com/global.component.button:modifierFamilies(first:24)",
    },
  },
  "client:https://ds.canonical.com/global.component.button:_meta": {
    __id: "client:https://ds.canonical.com/global.component.button:_meta",
    __typename: "EntityMeta",
    curie: "ds:global.component.button",
  },
  "https://ds.canonical.com/global": {
    __id: "https://ds.canonical.com/global",
    __typename: "Tier",
    name: "Global",
    uri: "https://ds.canonical.com/global",
  },
  "client:https://ds.canonical.com/global.component.button:documentationStages(first:1)":
    {
      __id: "client:https://ds.canonical.com/global.component.button:documentationStages(first:1)",
      __typename: "TagConnection",
      edges: {
        __refs: [
          "client:https://ds.canonical.com/global.component.button:documentationStages(first:1):edges:0",
        ],
      },
    },
  "client:https://ds.canonical.com/global.component.button:documentationStages(first:1):edges:0":
    {
      __id: "client:https://ds.canonical.com/global.component.button:documentationStages(first:1):edges:0",
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
  "client:https://ds.canonical.com/global.component.button:properties:0": {
    __id: "client:https://ds.canonical.com/global.component.button:properties:0",
    __typename: "Property",
    name: "variantSpecial",
    propertyType: "choice",
    optional: false,
    defaultValue: "default",
    constraints: "[default, special, exceptional]",
    summary: "?",
  },
  "client:https://ds.canonical.com/global.component.button:properties:1": {
    __id: "client:https://ds.canonical.com/global.component.button:properties:1",
    __typename: "Property",
    name: "anticipation",
    propertyType: "choice",
    optional: true,
    defaultValue: null,
    constraints: "Should affect background color and border",
    summary: "Buttons can consume the Anticipation modifier family",
  },
  "client:https://ds.canonical.com/global.component.button:properties:2": {
    __id: "client:https://ds.canonical.com/global.component.button:properties:2",
    __typename: "Property",
    name: "size",
    propertyType: "choice",
    optional: false,
    defaultValue: "default",
    constraints: null,
    summary:
      "Controls the size of the button. The smaller size can be used in places where space is at a premium.",
  },
  "client:https://ds.canonical.com/global.component.button:properties:3": {
    __id: "client:https://ds.canonical.com/global.component.button:properties:3",
    __typename: "Property",
    name: "icon",
    propertyType: "choice",
    optional: true,
    defaultValue: "no icon",
    constraints: null,
    summary:
      "Determines the icon that is being displayed in the button. Either text or an icon needs to be provided. If no text is provided but an icon is, it is an icon only button",
  },
  "client:https://ds.canonical.com/global.component.button:properties:4": {
    __id: "client:https://ds.canonical.com/global.component.button:properties:4",
    __typename: "Property",
    name: "content",
    propertyType: "text",
    optional: true,
    defaultValue: null,
    constraints: null,
    summary:
      "Determines the text that is being displayed in the button. Either text or an icon needs to be provided. If no text is provided but an icon is, it is an icon only button",
  },
  "client:https://ds.canonical.com/global.component.button:inheritsFroms(first:24)":
    {
      __id: "client:https://ds.canonical.com/global.component.button:inheritsFroms(first:24)",
      __typename: "UIBlockConnection",
      edges: {
        __refs: [],
      },
    },
  "client:https://ds.canonical.com/global.component.button:specializedBies(first:24)":
    {
      __id: "client:https://ds.canonical.com/global.component.button:specializedBies(first:24)",
      __typename: "UIBlockConnection",
      edges: {
        __refs: [
          "client:https://ds.canonical.com/global.component.button:specializedBies(first:24):edges:0",
        ],
      },
    },
  "client:https://ds.canonical.com/global.component.button:specializedBies(first:24):edges:0":
    {
      __id: "client:https://ds.canonical.com/global.component.button:specializedBies(first:24):edges:0",
      __typename: "UIBlockEdge",
      node: {
        __ref: "https://ds.canonical.com/global.component.dropdown_button",
      },
    },
  "https://ds.canonical.com/global.component.dropdown_button": {
    __id: "https://ds.canonical.com/global.component.dropdown_button",
    __typename: "Component",
    uri: "https://ds.canonical.com/global.component.dropdown_button",
    _meta: {
      __ref:
        "client:https://ds.canonical.com/global.component.dropdown_button:_meta",
    },
    "documentationStages(first:1)": {
      __ref:
        "client:https://ds.canonical.com/global.component.dropdown_button:documentationStages(first:1)",
    },
  },
  "client:__type:Component": {
    __id: "client:__type:Component",
    __typename: "__TypeSchema",
    __isNode: true,
    __isUIBlock: true,
  },
  "client:https://ds.canonical.com/global.component.dropdown_button:_meta": {
    __id: "client:https://ds.canonical.com/global.component.dropdown_button:_meta",
    __typename: "EntityMeta",
    title: "DropdownButton",
    curie: "ds:global.component.dropdown_button",
    type: {
      __ref: "https://ds.canonical.com/Component",
    },
  },
  "https://ds.canonical.com/Component": {
    __id: "https://ds.canonical.com/Component",
    __typename: "OntologyClass",
    _meta: {
      __ref: "client:https://ds.canonical.com/Component:_meta",
    },
    uri: "https://ds.canonical.com/Component",
  },
  "client:https://ds.canonical.com/Component:_meta": {
    __id: "client:https://ds.canonical.com/Component:_meta",
    __typename: "EntityMeta",
    title: "Component",
  },
  "client:https://ds.canonical.com/global.component.dropdown_button:documentationStages(first:1)":
    {
      __id: "client:https://ds.canonical.com/global.component.dropdown_button:documentationStages(first:1)",
      __typename: "TagConnection",
      edges: {
        __refs: [
          "client:https://ds.canonical.com/global.component.dropdown_button:documentationStages(first:1):edges:0",
        ],
      },
    },
  "client:https://ds.canonical.com/global.component.dropdown_button:documentationStages(first:1):edges:0":
    {
      __id: "client:https://ds.canonical.com/global.component.dropdown_button:documentationStages(first:1):edges:0",
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
  "client:https://ds.canonical.com/global.component.button:variants(first:24)":
    {
      __id: "client:https://ds.canonical.com/global.component.button:variants(first:24)",
      __typename: "UIBlockConnection",
      edges: {
        __refs: [],
      },
    },
  "client:https://ds.canonical.com/global.component.button:variantOfs(first:24)":
    {
      __id: "client:https://ds.canonical.com/global.component.button:variantOfs(first:24)",
      __typename: "UIBlockConnection",
      edges: {
        __refs: [],
      },
    },
  "client:https://ds.canonical.com/global.component.button:subcomponents(first:24)":
    {
      __id: "client:https://ds.canonical.com/global.component.button:subcomponents(first:24)",
      __typename: "SubcomponentConnection",
      edges: {
        __refs: [],
      },
    },
  "client:https://ds.canonical.com/global.component.button:modifierFamilies(first:24)":
    {
      __id: "client:https://ds.canonical.com/global.component.button:modifierFamilies(first:24)",
      __typename: "ModifierFamilyConnection",
      edges: {
        __refs: [
          "client:https://ds.canonical.com/global.component.button:modifierFamilies(first:24):edges:0",
          "client:https://ds.canonical.com/global.component.button:modifierFamilies(first:24):edges:1",
        ],
      },
    },
  "client:https://ds.canonical.com/global.component.button:modifierFamilies(first:24):edges:0":
    {
      __id: "client:https://ds.canonical.com/global.component.button:modifierFamilies(first:24):edges:0",
      __typename: "ModifierFamilyEdge",
      node: {
        __ref: "https://ds.canonical.com/global.modifier_family.anticipation",
      },
    },
  "https://ds.canonical.com/global.modifier_family.anticipation": {
    __id: "https://ds.canonical.com/global.modifier_family.anticipation",
    __typename: "ModifierFamily",
    uri: "https://ds.canonical.com/global.modifier_family.anticipation",
    _meta: {
      __ref:
        "client:https://ds.canonical.com/global.modifier_family.anticipation:_meta",
    },
    "modifiers(first:100)": {
      __ref:
        "client:https://ds.canonical.com/global.modifier_family.anticipation:modifiers(first:100)",
    },
  },
  "client:__type:ModifierFamily": {
    __id: "client:__type:ModifierFamily",
    __typename: "__TypeSchema",
    __isNode: true,
  },
  "client:https://ds.canonical.com/global.modifier_family.anticipation:_meta": {
    __id: "client:https://ds.canonical.com/global.modifier_family.anticipation:_meta",
    __typename: "EntityMeta",
    title: "Anticipation",
    curie: "ds:global.modifier_family.anticipation",
    type: {
      __ref: "https://ds.canonical.com/ModifierFamily",
    },
  },
  "https://ds.canonical.com/ModifierFamily": {
    __id: "https://ds.canonical.com/ModifierFamily",
    __typename: "OntologyClass",
    _meta: {
      __ref: "client:https://ds.canonical.com/ModifierFamily:_meta",
    },
    uri: "https://ds.canonical.com/ModifierFamily",
  },
  "client:https://ds.canonical.com/ModifierFamily:_meta": {
    __id: "client:https://ds.canonical.com/ModifierFamily:_meta",
    __typename: "EntityMeta",
    title: "Modifier Family",
  },
  "client:https://ds.canonical.com/global.modifier_family.anticipation:modifiers(first:100)":
    {
      __id: "client:https://ds.canonical.com/global.modifier_family.anticipation:modifiers(first:100)",
      __typename: "ModifierConnection",
      edges: {
        __refs: [
          "client:https://ds.canonical.com/global.modifier_family.anticipation:modifiers(first:100):edges:0",
          "client:https://ds.canonical.com/global.modifier_family.anticipation:modifiers(first:100):edges:1",
          "client:https://ds.canonical.com/global.modifier_family.anticipation:modifiers(first:100):edges:2",
        ],
      },
    },
  "client:https://ds.canonical.com/global.modifier_family.anticipation:modifiers(first:100):edges:0":
    {
      __id: "client:https://ds.canonical.com/global.modifier_family.anticipation:modifiers(first:100):edges:0",
      __typename: "ModifierEdge",
      node: {
        __ref: "https://ds.canonical.com/global.modifier.caution",
      },
    },
  "https://ds.canonical.com/global.modifier.caution": {
    __id: "https://ds.canonical.com/global.modifier.caution",
    __typename: "Modifier",
    uri: "https://ds.canonical.com/global.modifier.caution",
  },
  "client:https://ds.canonical.com/global.modifier_family.anticipation:modifiers(first:100):edges:1":
    {
      __id: "client:https://ds.canonical.com/global.modifier_family.anticipation:modifiers(first:100):edges:1",
      __typename: "ModifierEdge",
      node: {
        __ref: "https://ds.canonical.com/global.modifier.constructive",
      },
    },
  "https://ds.canonical.com/global.modifier.constructive": {
    __id: "https://ds.canonical.com/global.modifier.constructive",
    __typename: "Modifier",
    uri: "https://ds.canonical.com/global.modifier.constructive",
  },
  "client:https://ds.canonical.com/global.modifier_family.anticipation:modifiers(first:100):edges:2":
    {
      __id: "client:https://ds.canonical.com/global.modifier_family.anticipation:modifiers(first:100):edges:2",
      __typename: "ModifierEdge",
      node: {
        __ref: "https://ds.canonical.com/global.modifier.destructive",
      },
    },
  "https://ds.canonical.com/global.modifier.destructive": {
    __id: "https://ds.canonical.com/global.modifier.destructive",
    __typename: "Modifier",
    uri: "https://ds.canonical.com/global.modifier.destructive",
  },
  "client:https://ds.canonical.com/global.component.button:modifierFamilies(first:24):edges:1":
    {
      __id: "client:https://ds.canonical.com/global.component.button:modifierFamilies(first:24):edges:1",
      __typename: "ModifierFamilyEdge",
      node: {
        __ref: "https://ds.canonical.com/global.modifier_family.importance",
      },
    },
  "https://ds.canonical.com/global.modifier_family.importance": {
    __id: "https://ds.canonical.com/global.modifier_family.importance",
    __typename: "ModifierFamily",
    uri: "https://ds.canonical.com/global.modifier_family.importance",
    _meta: {
      __ref:
        "client:https://ds.canonical.com/global.modifier_family.importance:_meta",
    },
    "modifiers(first:100)": {
      __ref:
        "client:https://ds.canonical.com/global.modifier_family.importance:modifiers(first:100)",
    },
  },
  "client:https://ds.canonical.com/global.modifier_family.importance:_meta": {
    __id: "client:https://ds.canonical.com/global.modifier_family.importance:_meta",
    __typename: "EntityMeta",
    title: "Importance",
    curie: "ds:global.modifier_family.importance",
    type: {
      __ref: "https://ds.canonical.com/ModifierFamily",
    },
  },
  "client:https://ds.canonical.com/global.modifier_family.importance:modifiers(first:100)":
    {
      __id: "client:https://ds.canonical.com/global.modifier_family.importance:modifiers(first:100)",
      __typename: "ModifierConnection",
      edges: {
        __refs: [
          "client:https://ds.canonical.com/global.modifier_family.importance:modifiers(first:100):edges:0",
          "client:https://ds.canonical.com/global.modifier_family.importance:modifiers(first:100):edges:1",
          "client:https://ds.canonical.com/global.modifier_family.importance:modifiers(first:100):edges:2",
        ],
      },
    },
  "client:https://ds.canonical.com/global.modifier_family.importance:modifiers(first:100):edges:0":
    {
      __id: "client:https://ds.canonical.com/global.modifier_family.importance:modifiers(first:100):edges:0",
      __typename: "ModifierEdge",
      node: {
        __ref: "https://ds.canonical.com/global.modifier.primary",
      },
    },
  "https://ds.canonical.com/global.modifier.primary": {
    __id: "https://ds.canonical.com/global.modifier.primary",
    __typename: "Modifier",
    uri: "https://ds.canonical.com/global.modifier.primary",
  },
  "client:https://ds.canonical.com/global.modifier_family.importance:modifiers(first:100):edges:1":
    {
      __id: "client:https://ds.canonical.com/global.modifier_family.importance:modifiers(first:100):edges:1",
      __typename: "ModifierEdge",
      node: {
        __ref: "https://ds.canonical.com/global.modifier.secondary",
      },
    },
  "https://ds.canonical.com/global.modifier.secondary": {
    __id: "https://ds.canonical.com/global.modifier.secondary",
    __typename: "Modifier",
    uri: "https://ds.canonical.com/global.modifier.secondary",
  },
  "client:https://ds.canonical.com/global.modifier_family.importance:modifiers(first:100):edges:2":
    {
      __id: "client:https://ds.canonical.com/global.modifier_family.importance:modifiers(first:100):edges:2",
      __typename: "ModifierEdge",
      node: {
        __ref: "https://ds.canonical.com/global.modifier.tertiary",
      },
    },
  "https://ds.canonical.com/global.modifier.tertiary": {
    __id: "https://ds.canonical.com/global.modifier.tertiary",
    __typename: "Modifier",
    uri: "https://ds.canonical.com/global.modifier.tertiary",
  },
} as unknown as RecordMap;

export default componentEntityRecordsButton;
