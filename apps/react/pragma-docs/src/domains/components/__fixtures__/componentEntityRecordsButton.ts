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
    tokenBindings: {
      __refs: [
        "client:https://ds.canonical.com/global.component.button:tokenBindings:0",
        "client:https://ds.canonical.com/global.component.button:tokenBindings:1",
        "client:https://ds.canonical.com/global.component.button:tokenBindings:2",
        "client:https://ds.canonical.com/global.component.button:tokenBindings:3",
        "client:https://ds.canonical.com/global.component.button:tokenBindings:4",
        "client:https://ds.canonical.com/global.component.button:tokenBindings:5",
        "client:https://ds.canonical.com/global.component.button:tokenBindings:6",
        "client:https://ds.canonical.com/global.component.button:tokenBindings:7",
        "client:https://ds.canonical.com/global.component.button:tokenBindings:8",
        "client:https://ds.canonical.com/global.component.button:tokenBindings:9",
        "client:https://ds.canonical.com/global.component.button:tokenBindings:10",
        "client:https://ds.canonical.com/global.component.button:tokenBindings:11",
        "client:https://ds.canonical.com/global.component.button:tokenBindings:12",
        "client:https://ds.canonical.com/global.component.button:tokenBindings:13",
        "client:https://ds.canonical.com/global.component.button:tokenBindings:14",
        "client:https://ds.canonical.com/global.component.button:tokenBindings:15",
        "client:https://ds.canonical.com/global.component.button:tokenBindings:16",
        "client:https://ds.canonical.com/global.component.button:tokenBindings:17",
        "client:https://ds.canonical.com/global.component.button:tokenBindings:18",
        "client:https://ds.canonical.com/global.component.button:tokenBindings:19",
        "client:https://ds.canonical.com/global.component.button:tokenBindings:20",
        "client:https://ds.canonical.com/global.component.button:tokenBindings:21",
        "client:https://ds.canonical.com/global.component.button:tokenBindings:22",
        "client:https://ds.canonical.com/global.component.button:tokenBindings:23",
      ],
    },
    name: "Button",
    uri: "https://ds.canonical.com/global.component.button",
    usage:
      "Use buttons for meaningful interactions that transform, submit, or manipulate data, such as: \n\n- Submitting forms\n- Deleting items\n- Processing payments\n- Updating settings\n\nActions represent state changes in the application rather than simple navigation.\n\nButtons help establish clear visual hierarchy by signaling the most important actions available to users at any given moment. This hierarchy is critical to effective interface design. Users should immediately understand what action they're expected to take. \n\nWhile buttons should primarily trigger actions, they can occasionally be used for navigation when the context demands it. This is most appropriate for high-priority conversion points, such as call-to-action buttons in hero sections that direct users to, for example, sign-up flows or landing pages. In these cases, the button represents a key user journey rather than standard navigation. \n\n### When to use\n\n- For actions that transform, submit, or manipulate data\n- To draw attention to the most important action on a page or section\n- For high-priority conversion points or key user journeys\n- When the interaction represents a meaningful state change in the application\n\n### When not to use\n\n- For simple navigation between pages (use links instead)\n- When you already have a primary button visible in the current viewport (consider using secondary or tertiary button styles instead)\n- For multiple competing actions of equal importance (reconsider your information architecture and prioritize one clear primary action)\n\n### Call to actions\n\nAlmost always, there is an action that the user needs to perform on a page. Guide users toward the main action within the user flow that you have designed. **This means being opinionated about what action the user should be performing and using that as the primary call to action.** Rather than presenting users with an overwhelming array of choices, you should clearly signal the intended path forward. As a result, the main action on any given page should, in most cases, be represented by a primary button.\n\nBe deliberate about the number of calls-to-action you present. Each additional CTA dilutes the user's focus and makes it harder for them to decide what to do. Ideally, limit pages to as few CTAs as possible so users clearly understand their intended path forward. **As a rule of thumb, there should almost never be more than one primary button visible in the user's viewport at a time.** \n\nWhen multiple primary buttons compete for attention simultaneously, the hierarchy collapses and users face decision paralysis. If you find yourself needing multiple primary actions in view, reconsider whether they're all truly primary and whether some could be deprioritized or removed entirely.",
    guidelines:
      '# Button hierarchy\n\nEach button variant signals a different level of emphasis. Choose the variant that matches the role of the action on the page.\n\n\n\n**Primary**\n\nUse the primary variant for primary calls to action. Typical examples include the main action on an app’s table page, the hero call to action on a website.  It also confirms non-destructive actions, such as submitting a form or proceeding to the next step.\n\n**Secondary**\n\nUse the secondary variant for secondary actions paired with a primary button. Apply it when no single action on the page should dominate. Use it when all actions share the same level of importance, or when the user may or may not choose to act.\n\n**Tertiary**\n\nUse the tertiary variant for tertiary actions paired with a more prominent button, such as “Back” or “Cancel”. It holds the lowest level of emphasis, so only use it when the element is clearly a button. In practice, this means pairing it with other buttons. Icon-only buttons are often base buttons.\n\n  \n**Brand**\n\nUse the brand variant for actions and call to actions that live in an editorial setting, like sites or documentation tiers.  All button levels are available as a brand version.\n\n**Anticipation modifier family**\n\n**Constructive**\n\nUse the constructive modifier for buttons whose actions create something new, such as a new instance, a new machine, or a new row, if you need to emphasize the constructive/additive nature of it.  \n  \n**Destructive**\n\nUse the the destructive modifier to warn the user that a destructive, irreversible action will be triggered.\n\n\n\n**Combinations**\n\nShow at most one primary button, whether default or using modifiers, in a given view. Supplement it with secondary or tertiary buttons as needed, and make sure the primary button reflects the main action you want the user to take. If all actions share the same level of importance and you do not want to direct the user to a specific one, use secondary buttons. Always pair tertiary buttons with other buttons.  \n\n\n# Button order and alignment\n\nRight-align buttons when:\n\n- The action moves the user forward in a flow, such as forms, wizards, or checkout\n- The button appears in a modal dialog or confirmation window\n- The button appears in a settings or configuration panel\n- The button completes or submits something\n- The position follows the natural end of task after scanning content left to right\n\nLeft-align buttons when:\n\n- The button continues left-aligned content, such as a hero, card, or marketing block\n- The action is a “Back” or “Cancel” that returns users to a previous state\n- The button appears in an article page or a content-heavy context where buttons are secondary to the text\n\n# Icon buttons\n\nWhen space is limited and the actions have recognizable icons, buttons may use an icon without text. Reserve icon-only buttons for very common actions such as delete, edit, or close. Always pair an icon-only button with a [Tooltip](https://docs.superhuman.com/d/_dNyzE_TLZDh#_tugrid-20dWwIHYhx/_rui-ONb9LwkGvW) that states the action clearly. Add a delay to the [Tooltip](https://docs.superhuman.com/d/_dNyzE_TLZDh#_tugrid-20dWwIHYhx/_rui-ONb9LwkGvW) so it does not interrupt the user.\n\n# When to disable buttons\n\nYou should keep buttons enabled by default so users always know how to proceed. Disable a button only when the action is clearly unavailable.\n\nYou may disable a button, but you must ensure users understand why it is disabled and how to move forward. Pair the disabled button with a Tooltip that explains why the action is unavailable.\n\nThis matters most for form submissions. Users may miss a required field in longer or more complex forms, so a disabled submit button can leave them stuck without a clear reason. If you disable the button, make the cause visible; otherwise, keep it enabled and let validation feedback guide users to the mistake.\n\nThe same applies to external constraints like permissions, plan limits, or missing prerequisites. Where you can, offer an alternative that unblocks the user. For example, if an empty state depends on a prerequisite, show the action that completes the prerequisite instead of a disabled button.\n\n# Dual buttons\n\nOpposing actions can sometimes be combined into a single button, such as play and pause in a video player. The icon or label should reflect the action that will occur when the user presses the button. If the media is playing, show the pause icon. If it is paused, show the play icon. This aligns with user intent, because users select an action, not a status.\n\n# Text in buttons\n\nWrite button labels as a verb plus noun in sentence case, with no punctuation. Use clear, action-oriented language that names the outcome, such as "Get Ubuntu Pro" rather than a generic "Submit". When a button relates to a nearby heading, match the language so the action reads as a direct answer. For example, on a card with the heading "Would you like to save your changes?", label the button "Save changes".\n\n# Accessibility\n\n## Reduced motion\n\n- Disable animations when prefers-reduced-motion: reduce is set\n\n## Keyboard support and focus order\n\n- As the button is interactable it should be focused.\n- After the button is activated ensure the focus is set correctly based on the type of action the button performs. See [W3C WAI-ARIA Authoring Practices Button Design Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/button/) for a list of examples.\n- Once focussed, the associated action should be executed if the `Enter` or `Space` key is pressed.\n\n## Aria labels\n\n- In some contexts, it may be necessary to indicate to the user that a button is in a pressed state, such as when a button opens a contextual menu. This can be done by adding `aria-pressed="true"` to the button with JavaScript when the button is clicked, and removed when necessary.\n\n',
    changeLogs: {
      __refs: [
        "client:https://ds.canonical.com/global.component.button:changeLogs:0",
        "client:https://ds.canonical.com/global.component.button:changeLogs:1",
      ],
    },
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
    fields: {
      __refs: [
        "client:https://ds.canonical.com/global.component.button:_meta:fields:0",
        "client:https://ds.canonical.com/global.component.button:_meta:fields:1",
        "client:https://ds.canonical.com/global.component.button:_meta:fields:2",
        "client:https://ds.canonical.com/global.component.button:_meta:fields:3",
        "client:https://ds.canonical.com/global.component.button:_meta:fields:4",
        "client:https://ds.canonical.com/global.component.button:_meta:fields:5",
        "client:https://ds.canonical.com/global.component.button:_meta:fields:6",
        "client:https://ds.canonical.com/global.component.button:_meta:fields:7",
        "client:https://ds.canonical.com/global.component.button:_meta:fields:8",
        "client:https://ds.canonical.com/global.component.button:_meta:fields:9",
        "client:https://ds.canonical.com/global.component.button:_meta:fields:10",
        "client:https://ds.canonical.com/global.component.button:_meta:fields:11",
        "client:https://ds.canonical.com/global.component.button:_meta:fields:12",
        "client:https://ds.canonical.com/global.component.button:_meta:fields:13",
        "client:https://ds.canonical.com/global.component.button:_meta:fields:14",
        "client:https://ds.canonical.com/global.component.button:_meta:fields:15",
        "client:https://ds.canonical.com/global.component.button:_meta:fields:16",
        "client:https://ds.canonical.com/global.component.button:_meta:fields:17",
        "client:https://ds.canonical.com/global.component.button:_meta:fields:18",
        "client:https://ds.canonical.com/global.component.button:_meta:fields:19",
      ],
    },
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
    summary:
      "A Dropdown Button is a specialized button that includes a persistent chevron icon to indicate nested functionality. Unlike standard [Button](https://docs.superhuman.com/d/_dNyzE_TLZDh#_tugrid-20dWwIHYhx/_rui-8SdtbQUhTr)s that execute a single, immediate action, the Dropdown Button reveals a [ContextualMenu](https://docs.superhuman.com/d/_dNyzE_TLZDh#_tugrid-20dWwIHYhx/_rui-riXODq1wpR) of options or controls. This visual cue ensures users understand that an interaction will expand the interface to provide further choices rather than triggering an instantaneous system change.  \n",
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
    name: "Anticipation",
    uri: "https://ds.canonical.com/global.modifier_family.anticipation",
    _meta: {
      __ref:
        "client:https://ds.canonical.com/global.modifier_family.anticipation:_meta",
    },
    summary: "",
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
    name: "Caution",
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
    name: "Constructive",
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
    name: "Destructive",
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
    name: "Importance",
    uri: "https://ds.canonical.com/global.modifier_family.importance",
    _meta: {
      __ref:
        "client:https://ds.canonical.com/global.modifier_family.importance:_meta",
    },
    summary: "",
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
    name: "Primary",
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
    name: "Secondary",
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
    name: "Tertiary",
    uri: "https://ds.canonical.com/global.modifier.tertiary",
  },
  "client:https://ds.canonical.com/global.component.button:_meta:fields:0": {
    __id: "client:https://ds.canonical.com/global.component.button:_meta:fields:0",
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
  "client:https://ds.canonical.com/global.component.button:_meta:fields:1": {
    __id: "client:https://ds.canonical.com/global.component.button:_meta:fields:1",
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
  "client:https://ds.canonical.com/global.component.button:_meta:fields:2": {
    __id: "client:https://ds.canonical.com/global.component.button:_meta:fields:2",
    __typename: "ClassProperty",
    name: "variants",
    order: 4,
    group: { __ref: "https://ds.canonical.com/section.relations" },
  },
  "client:https://ds.canonical.com/global.component.button:_meta:fields:3": {
    __id: "client:https://ds.canonical.com/global.component.button:_meta:fields:3",
    __typename: "ClassProperty",
    name: "variantOfs",
    order: 3,
    group: { __ref: "https://ds.canonical.com/section.relations" },
  },
  "client:https://ds.canonical.com/global.component.button:_meta:fields:4": {
    __id: "client:https://ds.canonical.com/global.component.button:_meta:fields:4",
    __typename: "ClassProperty",
    name: "specializedBies",
    order: 2,
    group: { __ref: "https://ds.canonical.com/section.relations" },
  },
  "client:https://ds.canonical.com/global.component.button:_meta:fields:5": {
    __id: "client:https://ds.canonical.com/global.component.button:_meta:fields:5",
    __typename: "ClassProperty",
    name: "inheritsFroms",
    order: 1,
    group: { __ref: "https://ds.canonical.com/section.relations" },
  },
  "client:https://ds.canonical.com/global.component.button:_meta:fields:6": {
    __id: "client:https://ds.canonical.com/global.component.button:_meta:fields:6",
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
  "client:https://ds.canonical.com/global.component.button:_meta:fields:7": {
    __id: "client:https://ds.canonical.com/global.component.button:_meta:fields:7",
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
  "client:https://ds.canonical.com/global.component.button:_meta:fields:8": {
    __id: "client:https://ds.canonical.com/global.component.button:_meta:fields:8",
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
  "client:https://ds.canonical.com/global.component.button:_meta:fields:9": {
    __id: "client:https://ds.canonical.com/global.component.button:_meta:fields:9",
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
  "client:https://ds.canonical.com/global.component.button:_meta:fields:10": {
    __id: "client:https://ds.canonical.com/global.component.button:_meta:fields:10",
    __typename: "ClassProperty",
    name: "tier",
    order: 3,
    group: { __ref: "https://ds.canonical.com/section.overview" },
  },
  "client:https://ds.canonical.com/global.component.button:_meta:fields:11": {
    __id: "client:https://ds.canonical.com/global.component.button:_meta:fields:11",
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
  "client:https://ds.canonical.com/global.component.button:_meta:fields:12": {
    __id: "client:https://ds.canonical.com/global.component.button:_meta:fields:12",
    __typename: "ClassProperty",
    name: "usage",
    order: 1,
    group: { __ref: "https://ds.canonical.com/section.usage" },
  },
  "client:https://ds.canonical.com/global.component.button:_meta:fields:13": {
    __id: "client:https://ds.canonical.com/global.component.button:_meta:fields:13",
    __typename: "ClassProperty",
    name: "anatomyDsl",
    order: 1,
    group: { __ref: "https://ds.canonical.com/section.anatomy" },
  },
  "client:https://ds.canonical.com/global.component.button:_meta:fields:14": {
    __id: "client:https://ds.canonical.com/global.component.button:_meta:fields:14",
    __typename: "ClassProperty",
    name: "anatomyClassic",
    order: 2,
    group: { __ref: "https://ds.canonical.com/section.anatomy" },
  },
  "client:https://ds.canonical.com/global.component.button:_meta:fields:15": {
    __id: "client:https://ds.canonical.com/global.component.button:_meta:fields:15",
    __typename: "ClassProperty",
    name: "figmaLink",
    order: 6,
    group: { __ref: "https://ds.canonical.com/section.overview" },
  },
  "client:https://ds.canonical.com/global.component.button:_meta:fields:16": {
    __id: "client:https://ds.canonical.com/global.component.button:_meta:fields:16",
    __typename: "ClassProperty",
    name: "decisionLog",
    order: 2,
    group: { __ref: "https://ds.canonical.com/section.history" },
  },
  "client:https://ds.canonical.com/global.component.button:_meta:fields:17": {
    __id: "client:https://ds.canonical.com/global.component.button:_meta:fields:17",
    __typename: "ClassProperty",
    name: "version",
    order: 5,
    group: { __ref: "https://ds.canonical.com/section.overview" },
  },
  "client:https://ds.canonical.com/global.component.button:_meta:fields:18": {
    __id: "client:https://ds.canonical.com/global.component.button:_meta:fields:18",
    __typename: "ClassProperty",
    name: "summary",
    order: 2,
    group: { __ref: "https://ds.canonical.com/section.overview" },
  },
  "client:https://ds.canonical.com/global.component.button:_meta:fields:19": {
    __id: "client:https://ds.canonical.com/global.component.button:_meta:fields:19",
    __typename: "ClassProperty",
    name: "name",
    order: 1,
    group: { __ref: "https://ds.canonical.com/section.overview" },
  },
  "client:https://ds.canonical.com/global.component.button:changeLogs:0": {
    __id: "client:https://ds.canonical.com/global.component.button:changeLogs:0",
    __typename: "ChangeLogEntry",
    version: null,
    summary: null,
    change:
      "In order to disambiguate the button and the button link components there was a decision made in the contribution process meeting to keep the components together, until the discussion of affordances (and potentially use cases) have been finalized. In the documentation review meeting we came to the same decision.",
    changeType: "decision",
    timestamp: "2026-03-06T11:00:00.000+01:00",
  },
  "client:https://ds.canonical.com/global.component.button:changeLogs:1": {
    __id: "client:https://ds.canonical.com/global.component.button:changeLogs:1",
    __typename: "ChangeLogEntry",
    version: null,
    summary: null,
    change:
      "Decided to split the button into multiple components: the select and the dropdown became their own components. This means there is no need to have a right side icon for the button",
    changeType: "decision",
    timestamp: "2026-02-20T00:00:00.000+01:00",
  },
  "client:https://ds.canonical.com/global.component.button:tokenBindings:0": {
    __id: "client:https://ds.canonical.com/global.component.button:tokenBindings:0",
    __typename: "TokenBinding",
    node: "$root/icon",
    consumesSymbol: "https://dt.canonical.com/color.icon.disabled",
    rank: 1,
  },
  "client:https://ds.canonical.com/global.component.button:tokenBindings:1": {
    __id: "client:https://ds.canonical.com/global.component.button:tokenBindings:1",
    __typename: "TokenBinding",
    node: "$root/icon",
    consumesSymbol: "https://dt.canonical.com/modifier.color.text",
    rank: 2,
  },
  "client:https://ds.canonical.com/global.component.button:tokenBindings:2": {
    __id: "client:https://ds.canonical.com/global.component.button:tokenBindings:2",
    __typename: "TokenBinding",
    node: "$root/icon",
    consumesSymbol: "https://dt.canonical.com/modifier.color.icon",
    rank: 1,
  },
  "client:https://ds.canonical.com/global.component.button:tokenBindings:3": {
    __id: "client:https://ds.canonical.com/global.component.button:tokenBindings:3",
    __typename: "TokenBinding",
    node: "$root",
    consumesSymbol: "https://dt.canonical.com/color.focusRing",
    rank: 2,
  },
  "client:https://ds.canonical.com/global.component.button:tokenBindings:4": {
    __id: "client:https://ds.canonical.com/global.component.button:tokenBindings:4",
    __typename: "TokenBinding",
    node: "$root",
    consumesSymbol: "https://dt.canonical.com/modifier.color.focusRing",
    rank: 1,
  },
  "client:https://ds.canonical.com/global.component.button:tokenBindings:5": {
    __id: "client:https://ds.canonical.com/global.component.button:tokenBindings:5",
    __typename: "TokenBinding",
    node: "$root",
    consumesSymbol: "https://dt.canonical.com/dimension.200",
    rank: 1,
  },
  "client:https://ds.canonical.com/global.component.button:tokenBindings:6": {
    __id: "client:https://ds.canonical.com/global.component.button:tokenBindings:6",
    __typename: "TokenBinding",
    node: "$root",
    consumesSymbol: "https://dt.canonical.com/dimension.200",
    rank: 1,
  },
  "client:https://ds.canonical.com/global.component.button:tokenBindings:7": {
    __id: "client:https://ds.canonical.com/global.component.button:tokenBindings:7",
    __typename: "TokenBinding",
    node: "$root",
    consumesSymbol: "https://dt.canonical.com/dimension.100",
    rank: 1,
  },
  "client:https://ds.canonical.com/global.component.button:tokenBindings:8": {
    __id: "client:https://ds.canonical.com/global.component.button:tokenBindings:8",
    __typename: "TokenBinding",
    node: "$root",
    consumesSymbol: "https://dt.canonical.com/typography.text.secondary",
    rank: 1,
  },
  "client:https://ds.canonical.com/global.component.button:tokenBindings:9": {
    __id: "client:https://ds.canonical.com/global.component.button:tokenBindings:9",
    __typename: "TokenBinding",
    node: "$root",
    consumesSymbol: "https://dt.canonical.com/dimension.size.fontSize.300",
    rank: 1,
  },
  "client:https://ds.canonical.com/global.component.button:tokenBindings:10": {
    __id: "client:https://ds.canonical.com/global.component.button:tokenBindings:10",
    __typename: "TokenBinding",
    node: "$root",
    consumesSymbol: "https://dt.canonical.com/typography.weight.medium",
    rank: 1,
  },
  "client:https://ds.canonical.com/global.component.button:tokenBindings:11": {
    __id: "client:https://ds.canonical.com/global.component.button:tokenBindings:11",
    __typename: "TokenBinding",
    node: "$root",
    consumesSymbol: "https://dt.canonical.com/color.text.disabled",
    rank: 1,
  },
  "client:https://ds.canonical.com/global.component.button:tokenBindings:12": {
    __id: "client:https://ds.canonical.com/global.component.button:tokenBindings:12",
    __typename: "TokenBinding",
    node: "$root",
    consumesSymbol: "https://dt.canonical.com/color.text",
    rank: 2,
  },
  "client:https://ds.canonical.com/global.component.button:tokenBindings:13": {
    __id: "client:https://ds.canonical.com/global.component.button:tokenBindings:13",
    __typename: "TokenBinding",
    node: "$root",
    consumesSymbol: "https://dt.canonical.com/modifier.color.text",
    rank: 1,
  },
  "client:https://ds.canonical.com/global.component.button:tokenBindings:14": {
    __id: "client:https://ds.canonical.com/global.component.button:tokenBindings:14",
    __typename: "TokenBinding",
    node: "$root",
    consumesSymbol:
      "https://dt.canonical.com/color.border.highlighted.disabled",
    rank: 1,
  },
  "client:https://ds.canonical.com/global.component.button:tokenBindings:15": {
    __id: "client:https://ds.canonical.com/global.component.button:tokenBindings:15",
    __typename: "TokenBinding",
    node: "$root",
    consumesSymbol: "https://dt.canonical.com/color.border",
    rank: 3,
  },
  "client:https://ds.canonical.com/global.component.button:tokenBindings:16": {
    __id: "client:https://ds.canonical.com/global.component.button:tokenBindings:16",
    __typename: "TokenBinding",
    node: "$root",
    consumesSymbol: "https://dt.canonical.com/color.border.highlighted",
    rank: 2,
  },
  "client:https://ds.canonical.com/global.component.button:tokenBindings:17": {
    __id: "client:https://ds.canonical.com/global.component.button:tokenBindings:17",
    __typename: "TokenBinding",
    node: "$root",
    consumesSymbol: "https://dt.canonical.com/modifier.color.border",
    rank: 1,
  },
  "client:https://ds.canonical.com/global.component.button:tokenBindings:18": {
    __id: "client:https://ds.canonical.com/global.component.button:tokenBindings:18",
    __typename: "TokenBinding",
    node: "$root",
    consumesSymbol:
      "https://dt.canonical.com/color.foreground.primary.disabled",
    rank: 1,
  },
  "client:https://ds.canonical.com/global.component.button:tokenBindings:19": {
    __id: "client:https://ds.canonical.com/global.component.button:tokenBindings:19",
    __typename: "TokenBinding",
    node: "$root",
    consumesSymbol: "https://dt.canonical.com/color.foreground.primary.active",
    rank: 1,
  },
  "client:https://ds.canonical.com/global.component.button:tokenBindings:20": {
    __id: "client:https://ds.canonical.com/global.component.button:tokenBindings:20",
    __typename: "TokenBinding",
    node: "$root",
    consumesSymbol: "https://dt.canonical.com/color.foreground.primary.hover",
    rank: 1,
  },
  "client:https://ds.canonical.com/global.component.button:tokenBindings:21": {
    __id: "client:https://ds.canonical.com/global.component.button:tokenBindings:21",
    __typename: "TokenBinding",
    node: "$root",
    consumesSymbol: "https://dt.canonical.com/color.foreground.primary",
    rank: 2,
  },
  "client:https://ds.canonical.com/global.component.button:tokenBindings:22": {
    __id: "client:https://ds.canonical.com/global.component.button:tokenBindings:22",
    __typename: "TokenBinding",
    node: "$root",
    consumesSymbol:
      "https://dt.canonical.com/modifier.color.foreground.primary",
    rank: 1,
  },
  "client:https://ds.canonical.com/global.component.button:tokenBindings:23": {
    __id: "client:https://ds.canonical.com/global.component.button:tokenBindings:23",
    __typename: "TokenBinding",
    node: "$root",
    consumesSymbol:
      "https://dt.canonical.com/dimension.stroke.thickness.medium",
    rank: 1,
  },
} as unknown as RecordMap;

export default componentEntityRecordsButton;
