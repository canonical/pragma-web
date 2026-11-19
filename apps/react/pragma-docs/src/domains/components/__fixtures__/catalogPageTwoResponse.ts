/**
 * The graph's answer to `CatalogListPaginationQuery` for the two
 * components after the catalog fixture's page-1 end cursor: the wire
 * shape the catalog's "Load more" receives, captured verbatim from the
 * graph server with the operation's own text. Its pageInfo says the graph
 * holds more still.
 *
 * Regenerate: boot `graph` and POST the operation's `params.text` with
 * { count: 2, cursor: <catalogRecords' handle pageInfo endCursor> }.
 */

import type { GraphQLResponse } from "relay-runtime";

const catalogPageTwoResponse = {
  data: {
    components: {
      edges: [
        {
          node: {
            uri: "https://ds.canonical.com/global.component.rich_choices_field",
            tier: {
              name: "Global",
              uri: "https://ds.canonical.com/global",
              _meta: {
                title: "Global",
              },
            },
            __isNode: "Component",
            __typename: "Component",
            _meta: {
              title: "RichChoicesField",
              curie: "ds:global.component.rich_choices_field",
              definition: null,
              type: {
                _meta: {
                  title: "Component",
                },
                uri: "https://ds.canonical.com/Component",
                visibility: "PROMINENT",
                superclasses: [
                  {
                    uri: "https://ds.canonical.com/UIBlock",
                  },
                  {
                    uri: "https://ds.canonical.com/UIElement",
                  },
                  {
                    uri: "https://ds.canonical.com/Entity",
                  },
                ],
              },
            },
            __isUIBlock: "Component",
            version: null,
            summary:
              "A form control for selecting one or several options from a set whose choices can carry rich labels (text, icon, or richer content). It frames the set with a label, optional guidance, and validation, and supports either single-choice or multiple-choice selection.",
            inheritsFroms: {
              edges: [],
            },
            documentationStages: {
              edges: [
                {
                  node: {
                    _meta: {
                      title: "needs:definition",
                    },
                    uri: "https://ds.canonical.com/tag.needsdefinition",
                  },
                },
              ],
            },
            values: [
              {
                field: "tier",
                label: "tier",
                text: "Global",
                uri: "https://ds.canonical.com/global",
              },
              {
                field: "documentationStages",
                label: "documentationStage",
                text: null,
                uri: null,
              },
              {
                field: "version",
                label: "version",
                text: null,
                uri: null,
              },
              {
                field: "figmaLink",
                label: "figmaLink",
                text: null,
                uri: null,
              },
              {
                field: "modifierFamilies",
                label: "hasModifierFamily",
                text: null,
                uri: null,
              },
              {
                field: "usage",
                label: "usage",
                text: "A labelled set of selectable options, single- or multiple-choice, with richly-labelled choices.\n\n\n\n### When to use\n\n- Choosing one or several options from a small, visible set where the choices benefit from rich labels.\n\n\n\n### When not to use\n\n- A long list better searched than scanned — use [ComboboxField](https://docs.superhuman.com/d/_dNyzE_TLZDh#_tugrid-20dWwIHYhx/_rui-kfEQ25cX4a) .\n\n- A single binary decision — use [CheckboxField](https://docs.superhuman.com/d/_dNyzE_TLZDh#_tugrid-20dWwIHYhx/_rui-vwBCoHgXoG) .\n\n- Text-only options where layout control matters more than rich labels — use [ChoicesField](https://docs.superhuman.com/d/_dNyzE_TLZDh#_tugrid-20dWwIHYhx/_rui-IFk-NNRL3C) .",
                uri: null,
              },
              {
                field: "guidelines",
                label: "guidelines",
                text: "",
                uri: null,
              },
              {
                field: "anatomyDsl",
                label: "anatomyDsl",
                text: '---\n# Authored 2026-09-13 from @canonical/react-ds-global-form src/lib/common/Wrapper/styles.css on .ds.field\n# and src/lib/component/RichChoicesField/styles.css on .ds.form-rich-choices\n# The field chrome is the shared Wrapper\'s; the payload holds a grid of\n# options. In a rich option the native input is visually hidden and the LABEL\n# is the visible card surface, so the input chrome — border, radius,\n# background, and the hover / focus / selected / disabled recolours — sits on\n# the label rather than on the control. The previous notation\'s `role: control`\n# is kept as the hidden input it is.\nnode:\n  uri: global.component.rich_choices_field\n  styles:\n    layout.type: grid\n    layout.grid.columns: subgrid\n    # reads --form-field-columns.\n    layout.grid.column: "1 / -1"\n    layout.align: baseline\n    # reads --form-field-label-gap (--space-100 -> --dimension-100).\n    spacing.gap.block: spacing.gap.field.block\n  edges:\n    - node:\n        uri: global.subcomponent.field-label\n        styles:\n          layout.grid.column: "1 / -1"\n      relation:\n        cardinality: "1"\n        slotName: label\n    - node:\n        role: payload\n        styles:\n          layout.type: grid\n          layout.grid.columns: subgrid\n          layout.grid.column: "1 / -1"\n          # reads --form-group-gap (--space-100 -> --dimension-100).\n          spacing.gap.block: spacing.gap.field.block\n        edges:\n          - node:\n              uri: global.subcomponent.field-description\n              styles:\n                layout.grid.column: "1 / -1"\n            relation:\n              cardinality: "0..1"\n              slotName: description\n          - node:\n              role: rich choices group\n              styles:\n                layout.type: grid\n                layout.grid.columns: subgrid\n                layout.grid.column: "1 / -1"\n                appearance.border.style: none\n                spacing.internal.block.start: 0\n                spacing.internal.block.end: 0\n                spacing.internal.inline.start: 0\n                spacing.internal.inline.end: 0\n                spacing.external.block.start: 0\n                spacing.external.block.end: 0\n                spacing.external.inline.start: 0\n                spacing.external.inline.end: 0\n                # reads --form-group-gap (--dimension-100).\n                spacing.gap.block: spacing.gap.field.block\n              edges:\n                - node:\n                    role: option\n                    styles:\n                      layout.position: relative\n                      layout.type: flex\n                      # reads --rich-choices-span, a component-local track span.\n                      layout.grid.column: auto\n                    edges:\n                      - node:\n                          role: control\n                          styles:\n                            # Visually hidden: the label is the control\'s\n                            # visible surface.\n                            layout.position: absolute\n                            size.width: 1px\n                            size.height: 1px\n                            layout.overflow: hidden\n                            typography.whiteSpace: nowrap\n                            appearance.border.width: 0\n                        relation:\n                          cardinality: "1"\n                      - node:\n                          role: rich label\n                          styles:\n                            layout.type: flex\n                            layout.direction: column\n                            layout.flex.grow: 1\n                            layout.boxSizing: border-box\n                            # reads --form-group-gap (--dimension-100).\n                            spacing.gap.block: spacing.gap.field.block\n                            appearance.border.width: dimension.stroke.thickness.medium\n                            appearance.border.style: solid\n                            appearance.border.color: color.border\n                            appearance.radius: dimension.radius.small\n                            appearance.background: color.foreground.input\n                            typography.color: color.text\n                            interaction.cursor: pointer\n                            interaction.select: none\n                            # reads --hover--color-foreground-input first, a\n                            # computed state variable no symbol declares.\n                            appearance.background@hover: color.foreground.input.hover\n                            appearance.background@selected: color.foreground.input.hover\n                            appearance.border.color@focus: color.focusRing\n                            appearance.border.color@selected: color.focusRing\n                            # A disabled option shows no border by design.\n                            appearance.border.color@disabled: transparent\n                            appearance.background@disabled: color.foreground.input.disabled\n                            interaction.cursor@disabled: not-allowed\n                            # The disabled text colour reads\n                            # --disabled--color-text, a computed state variable\n                            # no symbol declares and with no literal fallback,\n                            # so that binding is dropped.\n                            motion.property: "border-color, background-color, box-shadow"\n                            # The card\'s own inline padding reads\n                            # --form-input-padding-inline (16px) and its block\n                            # padding --form-input-padding-block (8px), both\n                            # through --dimension-* symbols.\n                            spacing.internal.inline.start: dimension.200\n                            spacing.internal.inline.end: dimension.200\n                            spacing.internal.block.start: dimension.100\n                            spacing.internal.block.end: dimension.100\n                            # The focus and selected rings are box-shadows,\n                            # which the roster has no key for.\n                        relation:\n                          cardinality: "1"\n                          slotName: default\n                  relation:\n                    cardinality: "2..*"\n                    slotName: default\n            relation:\n              cardinality: "1"\n              slotName: default\n          - node:\n              uri: global.subcomponent.field-error\n              styles:\n                layout.grid.column: "1 / -1"\n            relation:\n              cardinality: "0..1"\n              slotName: error\n      relation:\n        cardinality: "1"',
                uri: null,
              },
              {
                field: "anatomyClassic",
                label: "anatomyClassic",
                text: "",
                uri: null,
              },
              {
                field: "properties",
                label: "hasProperty",
                text: null,
                uri: null,
              },
              {
                field: "tokenBindings",
                label: "hasTokenBinding",
                text: "TokenBinding, TokenBinding, TokenBinding, TokenBinding, TokenBinding, TokenBinding, TokenBinding, TokenBinding, TokenBinding, TokenBinding, TokenBinding, TokenBinding, TokenBinding, TokenBinding, TokenBinding, TokenBinding, TokenBinding, TokenBinding, TokenBinding, TokenBinding, TokenBinding, TokenBinding, TokenBinding, TokenBinding, TokenBinding",
                uri: null,
              },
              {
                field: "inheritsFroms",
                label: "inheritsFrom",
                text: null,
                uri: null,
              },
              {
                field: "specializedBies",
                label: "specializedBy",
                text: null,
                uri: null,
              },
              {
                field: "variantOfs",
                label: "variantOf",
                text: null,
                uri: null,
              },
              {
                field: "variants",
                label: "hasVariant",
                text: null,
                uri: null,
              },
              {
                field: "subcomponents",
                label: "hasSubcomponent",
                text: null,
                uri: null,
              },
              {
                field: "changeLogs",
                label: "changeLog",
                text: null,
                uri: null,
              },
              {
                field: "decisionLog",
                label: "decisionLog",
                text: null,
                uri: null,
              },
            ],
          },
          cursor:
            "aHR0cHM6Ly9kcy5jYW5vbmljYWwuY29tL2dsb2JhbC5jb21wb25lbnQucmljaF9jaG9pY2VzX2ZpZWxk",
        },
        {
          node: {
            uri: "https://ds.canonical.com/global.component.rich_text_field",
            tier: {
              name: "Global",
              uri: "https://ds.canonical.com/global",
              _meta: {
                title: "Global",
              },
            },
            __isNode: "Component",
            __typename: "Component",
            _meta: {
              title: "RichTextField",
              curie: "ds:global.component.rich_text_field",
              definition: null,
              type: {
                _meta: {
                  title: "Component",
                },
                uri: "https://ds.canonical.com/Component",
                visibility: "PROMINENT",
                superclasses: [
                  {
                    uri: "https://ds.canonical.com/UIBlock",
                  },
                  {
                    uri: "https://ds.canonical.com/UIElement",
                  },
                  {
                    uri: "https://ds.canonical.com/Entity",
                  },
                ],
              },
            },
            __isUIBlock: "Component",
            version: null,
            summary:
              "Reference: [https://github.com/canonical/design-system/discussions/35](https://github.com/canonical/design-system/discussions/35)",
            inheritsFroms: {
              edges: [],
            },
            documentationStages: {
              edges: [
                {
                  node: {
                    _meta: {
                      title: "needs:definition",
                    },
                    uri: "https://ds.canonical.com/tag.needsdefinition",
                  },
                },
              ],
            },
            values: [
              {
                field: "tier",
                label: "tier",
                text: "Global",
                uri: "https://ds.canonical.com/global",
              },
              {
                field: "documentationStages",
                label: "documentationStage",
                text: null,
                uri: null,
              },
              {
                field: "version",
                label: "version",
                text: null,
                uri: null,
              },
              {
                field: "figmaLink",
                label: "figmaLink",
                text: null,
                uri: null,
              },
              {
                field: "modifierFamilies",
                label: "hasModifierFamily",
                text: null,
                uri: null,
              },
              {
                field: "usage",
                label: "usage",
                text: "",
                uri: null,
              },
              {
                field: "guidelines",
                label: "guidelines",
                text: "",
                uri: null,
              },
              {
                field: "anatomyDsl",
                label: "anatomyDsl",
                text: "",
                uri: null,
              },
              {
                field: "anatomyClassic",
                label: "anatomyClassic",
                text: "",
                uri: null,
              },
              {
                field: "properties",
                label: "hasProperty",
                text: null,
                uri: null,
              },
              {
                field: "tokenBindings",
                label: "hasTokenBinding",
                text: null,
                uri: null,
              },
              {
                field: "inheritsFroms",
                label: "inheritsFrom",
                text: null,
                uri: null,
              },
              {
                field: "specializedBies",
                label: "specializedBy",
                text: null,
                uri: null,
              },
              {
                field: "variantOfs",
                label: "variantOf",
                text: null,
                uri: null,
              },
              {
                field: "variants",
                label: "hasVariant",
                text: null,
                uri: null,
              },
              {
                field: "subcomponents",
                label: "hasSubcomponent",
                text: null,
                uri: null,
              },
              {
                field: "changeLogs",
                label: "changeLog",
                text: null,
                uri: null,
              },
              {
                field: "decisionLog",
                label: "decisionLog",
                text: null,
                uri: null,
              },
            ],
          },
          cursor:
            "aHR0cHM6Ly9kcy5jYW5vbmljYWwuY29tL2dsb2JhbC5jb21wb25lbnQucmljaF90ZXh0X2ZpZWxk",
        },
      ],
      pageInfo: {
        endCursor:
          "aHR0cHM6Ly9kcy5jYW5vbmljYWwuY29tL2dsb2JhbC5jb21wb25lbnQucmljaF90ZXh0X2ZpZWxk",
        hasNextPage: true,
      },
    },
  },
} as unknown as GraphQLResponse;

export default catalogPageTwoResponse;
