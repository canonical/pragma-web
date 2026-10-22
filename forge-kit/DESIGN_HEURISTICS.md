# Prism design heuristics: the reviewer's checklist

Every item is a rule a reviewer can check. A breach is a finding: high when it breaks a numbered rule, medium when it leaves a rule only partly met. Cite the number.

## Grid and layout
1. `.grid.intrinsic` appears exactly once per app, on the Shell's single root element. Every layout container below it is `.subgrid`. No other `display: grid` with its own template in lens or app layout CSS.
2. Regions are placed by column count from the start (`grid-column: 1 / span 2`) and by negative lines from the end (`-4 / -1`); a fluid region spans between (`3 / -4`). No pixel widths on regions.
3. Layout containers set no `gap`: gutters are inherited from the grid.
4. Container queries only for a region that must change shape (the workspace stacking below three groups; the line strip turning vertical). The Shell root is the only query container. Thresholds are whole groups only: 448px, 912px, 1376px, each with a comment naming the group count. No media queries in lens or app CSS.
5. The narrow-screen rule is general and lives on the Shell: `--grid-col-min: min(100px, calc((100% - 3 * var(--grid-gutter)) / 4))`. No horizontal overflow at 390px.

## Archetypes and scrolling
6. Every lens page is one of two archetypes. Workspace: the canvas fills the viewport and never scrolls; the rail and the inspector scroll on their own at the viewport's height. Document: only the main column scrolls. The page's `scrollHeight` proves which.
7. The inspector is a persistent region in the workspace; the published SidePanel is used only as its drawer below three groups.

## Spacing and tokens
8. Spacing values come only from the `@canonical/styles` shim: `--container-gap-tight|default|loose`, `--component-padding-block|inline`, `--grid-gutter`, `--grid-margin`; prose uses `.editorial` and `.content-flow`. `--space-*` only where no semantic name fits, with the reason in a comment. Every gap and inset is a multiple of 4px.
9. Never `--dimension-*`, never a raw length other than 0 in a rule. Colour only through semantic tokens. Component tokens are declared on the component's root class, never on `:root`, and bind only to semantic tokens or the shim.
10. A decision with no token to bind (radius, letter spacing, stroke thickness, the monospace family) is bound in the anatomy to its literal and listed in the PR's token ledger; it is never written inline in a rule without the anatomy saying so.
11. Both apps use the `.docs` context at comfortable density; a dense region says so with the density class, not with smaller values.

## Typography and the Swiss rules
12. Flush left, ragged right. Hierarchy by size, weight and position; no boxes, backgrounds or colour to signal hierarchy. Identifiers in the monospace face; secondary text in the muted colour; at most four type sizes on a page.
13. Alignment comes from the grid: key-value rows, tables and lists align to subgrid lines, not to padding.

## Components, scaffold and placement
14. Every component folder matches `pragma create component react` output: `<Name>.tsx` with `componentCssClassName = "ds <kebab>"`, `types.ts` with `OwnProps & Omit<ComponentProps<root>, keyof OwnProps>`, `index.ts`, `styles.css` with the layer comment, `<Name>.test.tsx` (apps: `.tests.tsx`), `<Name>.ssr.test.tsx`, `<Name>.stories.tsx`, and `anatomy.yaml`.
15. General components live in `src/lib/ui/<Name>/`; domain components in apps in `src/domains/<subject>/lib/<Name>/`. Nothing else holds a component.
16. A published design-system component is used where one fits (Card, Tile, Badge, Tabs, Modal, Search, KeyboardKey, SkipLink, DescriptionList); a bespoke component exists only where none fits, and says so in its anatomy's leading comment.
17. Props follow `.kb/react-props.md`; no render props; every exported symbol has TSDoc; functions are verb-named; constants in `constants.ts`, reusable types in `types.ts`; `.at()` for array access.

## Anatomy
18. `anatomy.yaml` exists, was written before the code, validates against the anatomy DSL (closed roster of style keys, token symbols, states), and names every slot with its cardinality.
19. `styles.css` binds exactly the properties the anatomy declares, as the same `var()` chain in the same order, under the same state selectors, and nothing else.
20. A projection's anatomy carries `projection.on` and `projection.field`; its fragment's field paths and the anatomy's are the same set.

## Projections (the Figma matrix)
21. Five representations: Graph node, Chip, Card, List entry (32px row), Command (56px row). Slots: title, kind, location, summary, meta (vitals), keyValues, usage, preview. A representation renders only its slots, in the Figma's order: card = location, identifier with its parent, kind, summary, key values, footer vitals, optional tabbed preview; chip = optional key and separator, value, badge, icon, chevron; command = "title kind in location" left, one vital right.
22. Dispatch on `__typename` through one map per representation; every map key has an inline-fragment arm in the composite; the coverage test proves it.

## Interaction and states
23. Every lens page renders its empty, loading and error states. The current location is marked (`aria-current`). Every control has a label. Links look like links. Keyboard paths exist for every pointer path.
24. In the Definitions workspace: hover fades everything outside the neighbourhood; one selection is kept in sync across graph, rail and inspector; every reference in the inspector reselects; nodes take focus and select on Enter; a legend and a one-line hint sit over the canvas; the empty inspector says what to do.

## Strings and i18n readiness
25. Every reader-facing string is read through the catalog hook; no literal in JSX; no hard-coded `lang:`; no absolute path in a link; route patterns are locale-free.
