/**
 * The vocabulary the stylesheet and anatomy checks read a component by: how
 * a CSS declaration names a style key, how a custom property names a token
 * symbol, which selectors are interaction states, and which declarations
 * hold no design decision.
 */

/**
 * The style key each CSS property binds, as the anatomy DSL's roster names
 * it. A shorthand maps to the keys of the longhands it sets, and the checks
 * admit it only with a single value, so it sets every one of them to the
 * same thing. A side's border width and style map to the generic width and
 * style keys: the side is the colour key's to name.
 */
export const PROPERTY_KEYS: Readonly<Record<string, readonly string[]>> = {
  "align-content": ["layout.alignContent"],
  "align-items": ["layout.align"],
  "align-self": ["layout.alignSelf"],
  background: ["appearance.background"],
  "background-color": ["appearance.background"],
  "block-size": ["size.block"],
  "border-block-end-width": ["appearance.border.width"],
  "border-block-start-color": ["appearance.border.block.start.color"],
  "border-block-start-style": ["appearance.border.style"],
  "border-block-start-width": ["appearance.border.width"],
  "border-bottom-color": ["appearance.border.bottom.color"],
  "border-bottom-style": ["appearance.border.style"],
  "border-bottom-width": ["appearance.border.width"],
  "border-collapse": ["layout.table.collapse"],
  "border-color": ["appearance.border.color"],
  "border-inline-end-color": ["appearance.border.inline.end.color"],
  "border-inline-end-style": ["appearance.border.style"],
  "border-inline-end-width": ["appearance.border.width"],
  "border-radius": ["appearance.radius"],
  "border-style": ["appearance.border.style"],
  "border-top-width": ["appearance.border.top.width"],
  "border-width": ["appearance.border.width"],
  bottom: ["layout.offset.bottom"],
  "box-sizing": ["layout.boxSizing"],
  color: ["typography.color"],
  "column-gap": ["spacing.gap.inline"],
  container: ["layout.container"],
  "container-name": ["layout.container"],
  "container-type": ["layout.container"],
  cursor: ["interaction.cursor"],
  display: ["layout.type"],
  "flex-basis": ["layout.flex.basis"],
  "flex-direction": ["layout.direction"],
  "flex-grow": ["layout.flex.grow"],
  "flex-shrink": ["layout.flex.shrink"],
  "flex-wrap": ["layout.wrap"],
  font: ["typography.font"],
  "font-family": ["typography.fontFamily"],
  "font-size": ["typography.size"],
  "font-variant-caps": ["typography.variant.caps"],
  "font-variant-numeric": ["typography.variant.numeric"],
  "font-weight": ["typography.weight"],
  gap: ["spacing.gap"],
  "grid-area": ["layout.grid.area"],
  "grid-auto-rows": ["layout.grid.autoRows"],
  "grid-column": ["layout.grid.column"],
  "grid-row": ["layout.grid.row"],
  "grid-template-columns": ["layout.grid.columns"],
  "grid-template-rows": ["layout.grid.rows"],
  height: ["size.height"],
  "inline-size": ["size.inline"],
  "inset-block": ["layout.offset.block.start", "layout.offset.block.end"],
  "inset-block-end": ["layout.offset.block.end"],
  "inset-block-start": ["layout.offset.block.start"],
  "inset-inline-start": ["layout.offset.inline.start"],
  "justify-content": ["layout.justify"],
  left: ["layout.offset.left"],
  "letter-spacing": ["typography.letterSpacing"],
  "line-height": ["typography.lineHeight"],
  "list-style": ["layout.listStyle"],
  "list-style-type": ["layout.listStyle"],
  margin: [
    "spacing.external.block.start",
    "spacing.external.block.end",
    "spacing.external.inline.start",
    "spacing.external.inline.end",
  ],
  "margin-block": [
    "spacing.external.block.start",
    "spacing.external.block.end",
  ],
  "margin-block-end": ["spacing.external.block.end"],
  "margin-block-start": ["spacing.external.block.start"],
  "margin-bottom": ["spacing.external.bottom"],
  "margin-inline": [
    "spacing.external.inline.start",
    "spacing.external.inline.end",
  ],
  "margin-inline-end": ["spacing.external.inline.end"],
  "margin-inline-start": ["spacing.external.inline.start"],
  "margin-left": ["spacing.external.left"],
  "margin-right": ["spacing.external.right"],
  "margin-top": ["spacing.external.top"],
  "max-block-size": ["size.max.block"],
  "max-height": ["size.max.height"],
  "max-inline-size": ["size.max.width"],
  "max-width": ["size.max.width"],
  "min-block-size": ["size.min.block"],
  "min-height": ["size.min.height"],
  "min-inline-size": ["size.min.width"],
  "min-width": ["size.min.width"],
  opacity: ["appearance.opacity"],
  order: ["layout.order"],
  "outline-color": ["appearance.outline.color"],
  "outline-offset": ["appearance.outline.offset"],
  "outline-style": ["appearance.outline.style"],
  "outline-width": ["appearance.outline.width"],
  overflow: ["layout.overflow"],
  "overflow-block": ["layout.overflow.block"],
  "overflow-inline": ["layout.overflow.inline"],
  "overflow-x": ["layout.overflow.inline"],
  "overflow-wrap": ["typography.wrap"],
  "overflow-y": ["layout.overflow.block"],
  padding: [
    "spacing.internal.block.start",
    "spacing.internal.block.end",
    "spacing.internal.inline.start",
    "spacing.internal.inline.end",
  ],
  "padding-block": [
    "spacing.internal.block.start",
    "spacing.internal.block.end",
  ],
  "padding-block-end": ["spacing.internal.block.end"],
  "padding-block-start": ["spacing.internal.block.start"],
  "padding-bottom": ["spacing.internal.bottom"],
  "padding-inline": [
    "spacing.internal.inline.start",
    "spacing.internal.inline.end",
  ],
  "padding-inline-end": ["spacing.internal.inline.end"],
  "padding-inline-start": ["spacing.internal.inline.start"],
  "padding-left": ["spacing.internal.left"],
  "padding-top": ["spacing.internal.top"],
  "pointer-events": ["interaction.pointerEvents"],
  position: ["layout.position"],
  right: ["layout.offset.right"],
  "row-gap": ["spacing.gap.block"],
  "text-align": ["typography.align"],
  "text-decoration": ["typography.decoration"],
  "text-decoration-line": ["typography.decoration"],
  "text-overflow": ["typography.overflow"],
  "text-wrap": ["typography.wrap"],
  top: ["layout.offset.top"],
  "transition-duration": ["motion.duration"],
  "transition-property": ["motion.property"],
  "transition-timing-function": ["motion.easing"],
  "user-select": ["interaction.select"],
  "vertical-align": ["layout.verticalAlign"],
  visibility: ["appearance.visibility"],
  "white-space": ["typography.whiteSpace"],
  width: ["size.width"],
  "z-index": ["layout.stack"],
};

/**
 * The properties that set more than one style key, and so are admitted only
 * with a single value: two values would bind two keys differently.
 */
export const SHORTHAND_PROPERTIES: readonly string[] = [
  "inset-block",
  "margin",
  "margin-block",
  "margin-inline",
  "padding",
  "padding-block",
  "padding-inline",
];

/**
 * The multi-word segments a token symbol spells in camelCase, as the token
 * graph names them: a custom property `--color-focus-ring` is the symbol
 * `color.focusRing`, and `--typography-text-secondary-font-size` is
 * `typography.text.secondary.fontSize`. Every other hyphen is a dot.
 */
export const CAMEL_LIFTS: readonly (readonly [string, string])[] = [
  ["extra-bold", "extraBold"],
  ["extra-light", "extraLight"],
  ["focus-ring", "focusRing"],
  ["font-family", "fontFamily"],
  ["font-size", "fontSize"],
  ["font-weight", "fontWeight"],
  ["semi-bold", "semiBold"],
];

/**
 * The selector suffix each anatomy interaction state binds; a pressed
 * toggle button is selected, as a current link is. `:focus` serves
 * an element that takes focus only by script, which never shows a keyboard
 * ring; every other focusable element binds `:focus-visible`.
 */
export const STATE_SELECTORS: Readonly<Record<string, string>> = {
  ":active": "active",
  ":disabled": "disabled",
  ":focus": "focus",
  ":focus-visible": "focus",
  ":hover": "hover",
  '[aria-current="page"]': "selected",
  '[aria-pressed="true"]': "selected",
  '[aria-selected="true"]': "selected",
  "[open]": "expanded",
};

/**
 * How an anatomy names a custom state a modifier class marks: a `switch`
 * case whose role ends in the class in parentheses, such as
 * `faded node (.is-faded)`. The stylesheet writes the state as the slot's
 * class followed by the modifier, `.node.is-faded`.
 */
export const MODIFIER_ROLE = /\((\.[a-z][a-z0-9-]*)\)\s*$/;

/**
 * The selector qualifiers a component root or one of its slots may carry
 * without naming a state: `[href]` scopes the link-only rules of an element
 * that renders a link or inert text.
 */
export const LINK_QUALIFIERS: readonly string[] = ["[href]"];

/**
 * The properties no style key binds, because they set no design decision:
 * generated content, and whether forced colours may repaint an element.
 */
export const UNKEYED_PROPERTIES: readonly string[] = [
  "content",
  "forced-color-adjust",
];

/**
 * The literals a rule may hold outside a component token, because none is a
 * design decision: filling the containing block, the grid's free space, a
 * circle's half-box radius, and the viewport's height. A zero, with or
 * without a unit, is admitted everywhere.
 */
export const UNTHEMABLE_DECLARATIONS: readonly string[] = [
  "100%",
  "100dvh",
  "1fr",
  "50%",
];

/**
 * The style-key families a reflow may re-value: placement, size, spacing,
 * whether an element shows, and whether a border shows, as a divider
 * between sections does when what follows them changes. A container query
 * or a `:has()` rule that re-values anything else is a second design, not
 * a reflow.
 */
export const REFLOW_KEY_FAMILIES: readonly string[] = [
  "layout.",
  "size.",
  "spacing.",
  "appearance.visibility",
  "appearance.border.width",
];

/**
 * The container-query thresholds a stylesheet may use, each a whole number
 * of four-column groups of the intrinsic grid with its 16px gutter, and the
 * phrase the comment above the query names it by.
 */
export const GROUP_THRESHOLDS: Readonly<Record<number, string>> = {
  448: "one group",
  912: "two groups",
  1376: "three groups",
};

/** The one query container a layout reads: the shell's grid root. */
export const QUERY_CONTAINER_NAME = "shell";

/**
 * The media features a stylesheet may query, none of which can reflow
 * layout: forced colours and reduced motion.
 */
export const EXEMPT_MEDIA_FEATURES: readonly string[] = [
  "forced-colors",
  "prefers-reduced-motion",
];

/**
 * The spacing shim of `@canonical/styles` and the density channel: the
 * names a component token binds spacing and structure to without listing
 * them. A `--space-*` step is bound too, the token giving the step its role.
 */
export const SHIM_TOKENS: readonly string[] = [
  "--component-padding-block",
  "--component-padding-inline",
  "--container-gap-default",
  "--container-gap-loose",
  "--container-gap-tight",
  "--density-line-height",
  "--grid-gutter",
  "--grid-margin",
];

/** A spacing step of the shim's scale, read only through a component token. */
export const SPACE_STEP = /^--space-\d+$/;

/**
 * The primitive tiers a stylesheet never reads, each with the name a
 * finding gives it: a component token binds the semantic tier or the shim
 * above them, never the primitive below.
 */
export const PRIMITIVE_TOKENS: readonly {
  readonly pattern: RegExp;
  readonly name: string;
}[] = [
  { pattern: /(?<![\w-])--dimension-/, name: "--dimension-*" },
  { pattern: /(?<![\w-])--typography-weight-/, name: "--typography-weight-*" },
  {
    pattern: /(?<![\w-])--typography-font-family-/,
    name: "--typography-font-family-*",
  },
];

/** The one variable every grid and subgrid sets its gap from, on both axes. */
export const GRID_GAP_TOKEN = "--grid-gutter";

/** The shim's gaps between items, which no gap of a layout container reads. */
export const CONTAINER_GAP = /^--container-gap-/;

/** The properties that set a gap, on one axis or both. */
export const GAP_PROPERTIES: readonly string[] = [
  "gap",
  "row-gap",
  "column-gap",
];

/** The `display` values that lay out a grid. */
export const GRID_DISPLAYS: readonly string[] = ["grid", "inline-grid"];

/** A number with a unit: a length, a time, an angle or a percentage. */
export const UNIT_LITERAL =
  /(?<![\w.-])-?(?:\d+\.?\d*|\.\d+)(?:%|[a-z]+)(?![\w-])/g;

/**
 * The first line every generated component file opens with. The published
 * generator writes "Generated by"; its next release, the one that adds the
 * Relay option, writes "Scaffolded by". Either names the React component
 * generator and its version.
 */
export const GENERATOR_BANNER =
  /^(?:\/\/|\/\*) (?:Generated|Scaffolded) by @canonical\/summon-component:react v\d+\.\d+\.\d+/;

/**
 * The one-line exemption a props file states when its component renders no
 * element of its own, and so extends no native props.
 */
export const NO_ELEMENT_EXEMPTION = "renders no element of its own";

/** The subfolders a component folder may hold. */
export const COMPONENT_SUBFOLDERS: readonly string[] = ["common", "hooks"];

/**
 * Where a component folder may sit, relative to its package root: a general
 * component under `src/lib/ui`, a domain's under `src/domains/<subject>/lib`,
 * and a library's components grouped by subject under `src/lib/<subject>`,
 * such as the projections of one GraphQL type.
 */
export const COMPONENT_PLACEMENTS: readonly RegExp[] = [
  /^src\/lib\/ui\/[^/]+$/,
  /^src\/domains\/[a-z][a-z0-9-]*\/lib\/[^/]+$/,
  /^src\/lib\/[a-z][a-z0-9-]*\/[A-Z][A-Za-z0-9]*$/,
];

/** A cardinality: one count, or a range whose upper bound may be `*`. */
export const CARDINALITY = /^\d+(?:\.\.(?:\d+|\*))?$/;
