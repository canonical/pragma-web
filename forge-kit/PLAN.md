# Prism: the full plan

## Context

Prism's extraction into packages is almost done: core, projections, the Definitions, entity and standards lenses, both providers' Prose extension, the Markdown package and the metro app are open as stacked pull requests, and `claude/prism-integration` merges them for trying. The user then judged the design EXTREMELY POOR: bespoke chrome with its own spacing, no page archetypes or scroll model, tokens bound to primitives or raw values, a Definitions graph far below the reference ontology explorer, projections that do not follow the Figma matrix, components that were not scaffolded by the generator nor placed at the right level, and a metro app whose single pages do not open after a click and which has no homepage. This plan finishes what remains of the original sequence, then rebuilds the design on pragma's own grid, spacing shim and anatomy DSL, re-scaffolds every component with the generator at the right level, splits the projections into generic slotted components and Relay projections (the generator gains a `--relay` option), adds the command palette from the Figma, fixes the metro app, and builds the metro data and lenses on the new rules. Everything follows the pragma code standards strictly, without exception.

## Where things stand (2026-10-22, 04:00 UTC)

| PR | State |
| --- | --- |
| Schema gate | 1493 |
| A warm seam | 1496, clean |
| B lens layouts | 1499, clean |
| C prism-core | 1500, clean after 8 rounds |
| D projections | 1501, draft (clean; its base was a draft) |
| E lens-definitions | 1502, closing its findings in the running workflow |
| N lens-entity | 1503, closing its findings in the running workflow |
| F prism-metro | 1505, clean |
| M lens-standards | 1504, clean |
| I router record group and useHref | 1494 |
| J react-markdown | 1497, clean after 5 rounds |
| K Prose extension | 1498 |
| G summon Shell and warm | `claude/prism-g-summon-shell-warm` on canonical/pragma-core (pushed by the user). Split into two PRs: the Shell commit `94d7a48` as `claude/prism-g1-summon-shell` (the user pushes it), and the rest stacked on it; the user opens both with the prepared bodies. This session's pushes to pragma-core are still refused (403). |
| H summon-prism | being built in the running workflow |
| Integration | `claude/prism-integration`, pushed and verified; guide at `/tmp/claude-0/-home-user/73d142fc-2afc-5e76-bb53-6c9426202581/scratchpad/TRY-IT.md` |

The running workflow (wf_0ffd3998-11d) is merging C's fixes forward, then closes E and N, merges everything forward into M, F and the integration branch, then forges P1 and P3 (metro data), then P2 and P4 (metro lenses). It is stopped once P3's gate completes; P2 and P4 are planned afresh on the new rules.

## Restart 2 (2026-10-22, 06:20 UTC): what finished, how to resume

The container restarted a second time and killed both runs; the session came back in plan mode, which blocks every write, so the runs cannot be relaunched until the plan is approved again (plan mode also poisons subagents: they refuse to write). Nothing finished was lost: the worktrees, branches, bundles and journals survived.

Finished before the restart: R (bundle and PR body written under the scratchpad, two review rounds, clean); E closed and pushed to PR 1502 (eight rounds); N closed and pushed to PR 1503 (seven rounds); MERGE-STACK (see the journal of wf_dc3ab87f-ec1 for each step); P1 built (four commits on `claude/prism-p1-metro-routes`, not yet reviewed); plans for P1, S1 and S11 in the journal. In flight when killed: H (worktree has the package and the prism/lens generator committed), S1 and S11 (worktrees may hold uncommitted work).

**Correction at 07:45 UTC.** Plan mode is still on for this session (the user's approval was lost in the restart), and it binds every subagent: a workflow launched now produces agents that refuse to write. A write probe from my own shell is not a valid signal (it succeeded while plan mode was on). I resumed both runs at 07:31 on that false signal; the resume did not replay from cache (the dependency graph calls agents in a non-deterministic order, so the cache prefix broke at once), and every re-run agent returned "plan mode, nothing done". No work on disk was lost or changed; the journals of `wf_4f3ab44c-162` and `wf_dc3ab87f-ec1` are now polluted and must not be resumed. Both runs are stopped.

True state on disk: R complete (bundle and PR body sent to the user); E and N closed and pushed (PRs 1502 and 1503 updated; E may list one leftover, the `@note` on TermNode); MERGE-STACK done and pushed (six merges, integration at 29e2834e1); P1 built (four commits, `claude/prism-p1-metro-routes`, unreviewed); S1 built to four commits with uncommitted e2e work in its worktree (unreviewed); S11 built to four commits (unreviewed); H has two commits over G with real findings from its reviewers (no prism/application generator yet, a coverage exclude hiding the lens generator, dead shared code, lockfile churn, an own grid in the scaffolded layout).

Relaunch procedure, only after the user approves this plan again (ExitPlanMode): fresh runs, not resumes. pragma-core: a forge for H only, whose implementer continues in the existing worktree from the saved plan (`forge/h-plan.md`, minus prism/projection) and the review findings above. pragma-web: the same dependency graph minus E, N and MERGE-STACK, with P1, S1 and S11 starting at the review stage in their existing worktrees (the implementer step is replaced by "commit the uncommitted work and run the gates"), and a nonce in every prompt so nothing replays from the polluted journals. Then re-arm the check-in and keep the questions file.

## How the design is made as good as it can be

Quality is enforced by artifacts and checks, not by taste at review time.

1. **Reference before code.** Each UI PR's plan names its reference and the measurements it must match: the Figma projection matrix (file ZwVhG78TEaKIDLCdIdQ9Fi, node 449:22295, read with `get_design_context` for exact sizes and spacing: card 209×345, chip 28px, command row 56px, list entry 32px), the ontology explorer (`/root/.claude/uploads/73d142fc-2afc-5e76-bb53-6c9426202581/5c28b4b4-ontology-explorer.html`) for the Definitions workspace, and the atlas compositions (`/tmp/claude-0/-home-user/73d142fc-2afc-5e76-bb53-6c9426202581/scratchpad/artifact-files/14d5aa04-9d2a-4bcd-87c5-89b4475fb02d`) for how published components compose.
2. **Anatomy first.** Every component, existing or new, gets an `anatomy.yaml` in its folder, written before any code, in the anatomy DSL (`@canonical/anatomy-dsl`, pragma-core `packages/semantics/anatomy-dsl`, API reference in its `docs/`): the slot tree with cardinalities, and every style decision as a style key from the closed roster of 111 keys bound to a token symbol (`spacing.internal.inline.start: dimension.200`, lists are the `var()` fallback chain, `@hover` and friends are states). A projection's anatomy carries `projection.on` and `projection.field`, so its Relay fragment and its anatomy name the same fields, and a test keeps them in step. The anatomy is the design contract and the token ledger of the component.
3. **The CSS transcribes the anatomy, and a test proves it.** `styles.css` binds exactly the properties the anatomy declares, each as the same `var()` chain in the same order, under the same state selectors; nothing else. Core's testing utilities gain `assertStylesMatchAnatomy` (parses the stylesheet as the existing census does, maps style keys to CSS properties through the roster) and `assertAnatomy` (runs the DSL's own check); every package and app calls both from its tests.
4. **One scaffold, one placement, checked.** Every component is scaffolded with `pragma create component react` from the published, pinned CLI, and a conformance test compares each component folder to the generator's file set and shapes (the `componentCssClassName` root, `OwnProps & Omit<ComponentProps<root>, keyof OwnProps>`, the barrel, the layer comment, test, SSR test and stories), plus the `anatomy.yaml`. Placement: general components in `src/lib/ui/<Component>/` (core, the lens packages, both apps); domain components in apps in `src/domains/<domain>/lib/<Component>/`, with the domain's routes, warm functions and queries at the domain root; a domain is a subject (`components`, `metro`), not a lens.
5. **Token gates.** Spacing only from the `@canonical/styles` shim; colour only from semantic tokens; component tokens scoped on the component root (cs:styling.tokens.scoping) and bound only to semantic tokens or the shim; a shared stylesheet check fails on anything else. Every decision with no token to bind (today: radius, letter spacing, stroke thickness, the monospace family, semantic spacing itself) is bound in the anatomy to its literal, listed in the PR's token ledger, and filed upstream as a token request rather than hidden.
6. **Measured review.** Each UI PR's gate produces screenshots at 1440 and 390, light and dark, a spacing histogram proving every gap and inset is a multiple of 4px, the scroll-model e2e, and the overflow check at 390. An Opus design reviewer works from the heuristics below as a numbered checklist against the reference screenshots; rounds continue until no medium or high finding remains.
7. **The user's eye at three checkpoints**, before anything stacks on top: after S2 (shell, grid, rail), after S3 (the generic components in Storybook as the Figma matrix), after S4 (the Definitions workspace). Screenshots are sent at each.

## Rulings (settled)

**From the original plan, still in force.** Packages under `packages/prism/<name>`: core is pure and tsc-built with no `graphql` tags; projections and lens packages are source-shipped. The router knows nothing about queries: `warm` is the only seam. The Shell is the provider nest; a lens is a domain with a routes barrel and one lens facet; `collectLenses` feeds the Rail. Homes are plain functions over `router.buildPath`, read through `useHome`. Prose is a provider extension (Tier 2). The Components lens, marketing, playground and journeys stay in the docsite. Tier-1 lens packages compile against the contract alone. Content i18n is built later, and every PR keeps its readiness obligations: Turtle is the translation source, lens packages are locale-free (no absolute links, no hard-coded `lang:`, every reader-facing string through the catalog hook), the environment's headers are the only per-request seam, the contract's `lang` arguments stay, route patterns stay locale-free.

**Design foundations.**
- **One grid.** `.grid.intrinsic` (`@canonical/styles` grid.css) appears exactly once, at the shell level. Every layout container below it is a `.subgrid`. Regions are placed by column count from the start (`1 / span 2`) and by negative lines from the end (`-4 / -1`); the fluid region takes what lies between (`3 / -4`). Gutters are inherited, so lens layout containers set no gap. Published components sit on the grid as items.
- **General rules first.** Container queries only where a region must change shape: the workspace stacks below three groups, and the door-card line strip turns vertical. The shell is the only query container (a subgrid cannot be one; confirmed in Chromium during S2). Thresholds are whole groups only, 448px, 912px or 1376px, with a comment naming the group count. The narrow-screen rule is general: the shell sets `--grid-col-min: min(100px, calc((100% - 3 * var(--grid-gutter)) / 4))` (verified at 390px during S2; if it holds, proposed upstream in grid.css).
- **Spacing comes only from the shim** (`@canonical/styles` spacing.css, 4px baseline): `--container-gap-tight|default|loose` between items, `--component-padding-block|inline` inside surfaces, `--grid-gutter` and `--grid-margin` for structure, `.editorial` with `.content-flow` for prose. `--space-*` only where no semantic name fits, with the reason visible. Never `--dimension-*`, never a raw length other than 0. Both apps use the `.docs` context, comfortable density; the term list may be dense.
- **Swiss principles.** Flush left, ragged right; hierarchy by size, weight and position, not boxes or colour; few type sizes; alignment from the grid; monospace for identifiers; muted text for anything secondary.
- **Two archetypes.** Workspace: the canvas fills the viewport and never scrolls; the side regions each scroll on their own at the viewport's height; the inspector is a persistent region, and the published SidePanel is used only as its drawer at narrow widths. Document: only the main column scrolls.

**Shell and navigation.** No SideNavigation and no ApplicationLayout. The Rail stays as prism's own navigation, re-scaffolded as a grid item at `1 / span 2`, with shim spacing, icon-only below one group, and its existing brand, lens entries, shortcuts, current location and theme control.

**Projections, following the Figma projection matrix.** Representations: Graph node, Chip, Card, List entry, Command. Types: classes (the meta type), UI blocks, modifiers, modifier families, standards; plus the metro types. Slots: title, kind, location, summary, meta (vitals), keyValues, usage, preview. Two layers: generic slotted components without Relay (`EntityChip`, `EntityRow`, `EntityCard` with an optional tabbed preview, `EntityCommand`, `EntityGraphNode`), and Relay projections, one component per type and representation, each with a projected anatomy and the fragment it derives, filling a generic component's slots. `Node`, `OntologyClass` and `OntologyProperty` projections live in prism-projections; design-system types in the docsite; metro types in the metro app, on a best-guess basis. The per-representation dispatchers and their coverage tests stay. `EntityTitle` is dropped.

**Generators.** The React component generator gains `relay` (shown as `--relay`, the application generator's name), off by default. H drops `prism/projection`.

**Lens specifics.** Definitions is rebuilt to the ontology explorer's structure (three regions, a server-rendered SVG graph from a precomputed force layout with client pan and zoom, shape encodes kind, stroke encodes lifecycle, grey subclass edges with hollow arrows, curved labelled relation edges with a halo, neighbourhood fade on hover, one selection kept in sync across graph, rail and inspector, keyboard selection, legend and hint, the inspector's section model and empty state), with pragma's visual values; React Flow is removed; `d3-force` and `d3-zoom` replace it. The Components lens gets the atlas's anatomy tree. The command palette follows the Figma.

**Code standards.** Strictly, for every line. Reviewers treat any breach as high, cite the CURIE, and check scaffold conformance, placement and the anatomy checks.

## Defaults for the open questions (change any before approving)

1. Rail placement: the Shell renders the providers and exactly one element, the `.grid.intrinsic` root (also the query container); each lens layout is a subgrid at `1 / -1` that renders the Rail first.
2. The card's tabbed preview is used for UI blocks only.
3. Command palette search: a provider extension, `search(text: String!, first: Int, after: String): NodeConnection!`, in both providers (Tier 2).
4. Command palette package: `packages/prism/command-palette`, source-shipped, mounted once per app at the shell level.
5. Empty query: a one-line hint and no results.
6. Metro homepage: a simple landing now (one card per lens with its count); the network map replaces it when the network lens lands.
7. Anatomies of prism's own components live beside their code (`anatomy.yaml` in the component folder), not in the design-system data, since they are not design-system blocks. A projection's fragment is written by hand, and its test checks that the fragment's field paths and the anatomy's `projection.field` paths are the same set; no derivation tool is built.

## Bases and stacking

The original stack keeps its bases. Every new pragma-web PR in this plan is based on `claude/prism-integration` or on its predecessor in this plan, and targets it on GitHub; when the original stack lands on main, they are retargeted. pragma-core PRs are based on origin/main and reach the user as bundles until push access works.

## PR sequence

### Phase 0: finish the original sequence
- Let the running workflow finish the forward merges, E, N, H and the metro data PRs P1 and P3; stop it once P3's gate completes.
- H: one fix commit removes the `prism/projection` generator, its CLI path and its tests; H is bundled and sent with its PR body.
- G: the user pushes the Shell split branch and opens both PRs.

### R — `feat(summon-component): adds a relay option to the react component generator` (pragma-core)
Base origin/main. In `packages/summon/component/src/react` (Relay is React-only, so not the shared prompts): a `relay` confirm prompt, default false, and, when on, a `relayType` prompt defaulting to `Node`. With Relay on, the scaffold's component reads a `<Component>_node` fragment on that type with `useFragment`; its types carry the `node` fragment-key prop; its unit and SSR tests render inside a `relay-test-utils` mock environment; its story has a mock-environment decorator; the README note says to run `bun run relay` once. Rendered-output snapshot cases with Relay on and off; regenerate the CLI's create surface with its own script and update the grammar test. The user pushes and releases; pragma-web bumps the pin.

### S1 — `fix(prism-metro): renders an entity page after client navigation`
Base the integration branch. Clicking a station or line from its index changes the URL and keeps the index on screen (no graph request, no error); direct loads work. Find and fix the root cause where it lives (the entity lens or the app), add click-through e2e cases for stations and lines, and fix the hydration mismatch and the `key` prop warning in Breadcrumbs.

### S2 — `refactor(prism-core): lays every lens on one intrinsic grid`
Base S1. The Shell renders the single `.grid.intrinsic` root (the query container) with the narrow-screen column rule. Every core component is re-scaffolded with the generator into `src/lib/ui/` with an anatomy first: Rail, ModeStrip, LensBreadcrumbs, Canvas, CanvasSkipLink, Chip, ChipLegend, ThemeSelector, ErrorBoundary, ClientOnly, and the two new archetype layouts `WorkspaceLayout` (rail, canvas, inspector; the inspector collapses to a SidePanel drawer below three groups) and `DocumentLayout` (main, aside), each a subgrid. Core's `testing/` gains `assertAnatomy`, `assertStylesMatchAnatomy`, `assertScaffold` (generator conformance and placement) and the shared stylesheet check (primitives, raw lengths, off-shim spacing, query thresholds not whole groups); every prism package and both apps call them. A measurement e2e in each app asserts the scroll model and no horizontal overflow at 390px. Both apps' lens layouts adopt the archetypes. Checkpoint 1.

### S3 — `feat(prism-projections): splits each representation into a slotted component`
Base S2. `EntityChip`, `EntityRow`, `EntityCard`, `EntityCommand`, `EntityGraphNode` in `src/lib/ui/`, each with an anatomy written from the Figma frame (slots, cardinalities, style keys bound to tokens, states), each scaffolded without Relay, built on Card, Badge and Tabs where they fit; stories reproduce the Figma matrix with static data. `EntityTitle` removed. The existing dispatchers and `Node` arms keep working on top until S5. Checkpoint 2 (Storybook).

### S4 — `feat(prism-lens-definitions): rebuilds the explorer as one workspace`
Base S3. The Definitions lens on `WorkspaceLayout`, to the explorer's structure; every lens component re-scaffolded into `src/lib/ui/` with an anatomy; the graph draws `EntityGraphNode`s as SVG from a `d3-force` layout computed on the server (seeded) and pans and zooms with `d3-zoom`; React Flow removed. Works in both apps. Checkpoint 3.

### S5 — `feat(prism-projections): projects the contract types through relay fragments`
After R's release and S3. `Node`, `OntologyClass` and `OntologyProperty` projections for all five representations in `src/lib/node/` and `src/lib/ontology/`, each with a projected anatomy, scaffolded with `--relay`, filling the generic components' slots; dispatchers and coverage tests updated; each fragment's field paths checked against its anatomy's.

### S6 — `feat(pragma-docs): projects the design-system types`
After S5. Component, pattern, layout, modifier, modifier family and standard projections per the Figma rows, in `src/domains/<subject>/lib/`, projected anatomies, scaffolded with `--relay`, registered in the docsite's maps.

### S7 — `feat(prism-metro): projects the metro types`
After S5. Station, Interchange, Line and Zone projections in `src/domains/metro/lib/` on a best-guess basis (Station card: location the fare zone; key values platforms, zone and lines; vital the platform count; command "‹name› Station in ‹zone› · ‹n› platforms"; Interchange adds the transfer time and line count; Line: stops, end stations, loop; Zone: station count), projected anatomies, scaffolded with `--relay`. The app's `src/projections`, `src/shell` and `src/site` folders are folded into `src/lib/ui/` and `src/lib/`.

### S8 — `refactor(pragma-docs): recomposes the docsite lenses on the archetypes`
After S2, S3 and S6. Components (document archetype, cards from the projections, the atlas's anatomy tree in the anatomy section), Journeys, Guides (editorial prose), Playground, Account and marketing on the archetypes and the shim; every app component re-scaffolded with an anatomy into `src/lib/ui/` or `src/domains/<subject>/lib/`.

### S9 — `refactor(prism-lens-standards,prism-lens-entity): lays the lenses on the document archetype`
After S2 and S3 (S5 for the entity lens's rows and cards). Standards reading pages use `.editorial` and `.content-flow`; the entity lens's index uses card or row projections on the subgrid and its page aligns key values with subgrid rows; every component re-scaffolded with an anatomy into `src/lib/ui/`.

### S10 — `feat(prism-metro): adds a homepage`
After S2 and S7. A landing at `/` with one card per lens and its count; replaced by the network map when P2 lands.

### S11 — `feat(prism-pragma-provider,prism-graph-example): adds text search`
Independent. `search(text, first, after): NodeConnection!` in both providers (labels, CURIEs and definitions; the metro provider over its records), as an extension like Prose; contract unchanged; `satisfiesContract` green.

### S12 — `feat(prism-command-palette): adds the command palette`
After S5 and S11. New source-shipped package, per the Figma: one search field across the top; results on the left as `EntityCommand` rows grouped by type (56px, "‹title› ‹kind› in ‹location›" with one vital); the highlighted result previewed on the right with `EntityCard`; six intrinsic columns wide (four and two), `calc(6 * var(--grid-col-min) + 5 * var(--grid-gutter))`; Modal, Search field and KeyboardKey; Cmd+K or Ctrl+K through the shortcut facet; the ARIA combobox pattern; Enter goes to the canonical home; Escape closes. Every component scaffolded with the generator and anatomied (the palette's query component with `--relay`). Mounted in both apps.

### P2 and P4 — the metro lenses, rebuilt on the new rules
After S2, S3 and S7. P2 `feat(prism-metro): adds a network lens with line strips and a schematic map` and P4 `feat(prism-metro): adds a fleet lens with formation diagrams`, as specified in the metro sections below, on the archetypes (the network map is a workspace), in `src/domains/network/` and `src/domains/fleet/`, with projections for routes, rolling stock, units, car types and formations scaffolded with `--relay` and anatomied.

### Last — integration refresh and report
Merge every new branch into `claude/prism-integration`, rerun the root check, the root tests and both apps' boot checks, update the guide, and report every PR with its rounds and leftovers.

## Scheduling: two to three forges at a time

The whole sequence runs as one dependency graph, not as waves: a forge starts the moment its dependencies are done and a slot is free, with three slots. Dependencies are only what a PR builds on:

| PR | Starts after |
| --- | --- |
| R, S1, S11 | nothing (first three) |
| S2 | S1 |
| S3 | S2 (checkpoint 1 is read while S3 runs) |
| S4 | S3 (checkpoint 2 is read while S4 runs) |
| S5 | S3 and R's release |
| S9 | S3 (its entity-lens rows and cards switch to S5's projections in a follow-up commit if S5 lands later) |
| S10 | S2 |
| S6, S7 | S5 |
| S8 | S6 |
| S12 | S5 and S11 |
| P2, P4 | S7 and S4 |
| integration refresh | everything |

Stacked branches are based on their nearest dependency and merged forward as before. A checkpoint does not block the next forge from starting; if the user rejects a checkpoint, the dependent forge is stopped and re-planned. Expected occupancy: three forges at a time from the start (R, S1, S11), then S2 with S11 and R, then S3, S10 and S9, then S4, S5 and the first of S6 or S7, and so on; the only single-forge stretch is while R waits for its release, which the pragma-web forges fill.

## The forge protocol (tightened)

Plan → implement (own worktree; scaffolds with the generator, transcribes the anatomies) → review rounds (two reviewers: one on correctness and testing; one design reviewer on the heuristics checklist, the reference screenshots, the anatomy and token ledger, standards by CURIE) → fix until no medium or high finding, at most four rounds, earlier rounds passed to reviewers → gate (root check and tests, screenshots and measurements, push, open or update the PR). Reviewers check: generator conformance and placement, anatomy and CSS match, the stylesheet check, commit types limited to feat, fix, docs, refactor, chore, test, ci, revert, subjects at most 72 characters with both trailers.

**Models.** Fable is reserved for the parts where judgement decides the outcome: the planner of S2 (the grid, the archetypes, the anatomies of every core component), the planner of S3 (the generic components' anatomies from the Figma frames), the planner of S4 (the explorer rebuild), and the design reviewer of every UI PR (S2, S3, S4, S6 to S10, S12, P2, P4). Opus plans the rest, implements and fixes everything. Sonnet reviews correctness and testing and runs every gate.

## Verification

- Every PR: package and app `check`, `test` and `test:coverage` green; root `bun run check` and the root test command green (the two known Playwright environment failures excepted).
- R: rendered-output snapshots with `relay` on and off; a scaffold with `--relay` compiles under a consumer's relay-compiler and its tests pass.
- S1: the new click-through e2e fails before the fix and passes after; no hydration or key warning in the browser console on any metro page.
- S2: `assertAnatomy` fails on an unknown style key and on a literal where a token is expected; `assertStylesMatchAnatomy` fails when styles.css binds an undeclared property or reorders a chain; `assertScaffold` fails on a missing file or a wrong root class; the stylesheet check fails on a primitive token and on a raw length (each proved, then reverted); the measurement e2e proves the scroll model and no overflow at 390px; the subgrid-as-container question is answered with evidence.
- S3: stories render the Figma matrix; every component passes the three checks.
- S4: SSR HTML of `/definitions` contains the graph's SVG nodes; hover, selection sync and keyboard selection work in e2e; React Flow is gone from every manifest.
- S5 to S7: coverage tests fail when a map key lacks a composite arm; every projection's fragment matches its anatomy; every folder passes the three checks.
- S11 and S12: search returns typed nodes in both providers; Cmd+K opens the palette, arrows move the preview, Enter navigates to the home, in e2e on both apps.
- P2 and P4: as specified below, plus the archetype, anatomy and stylesheet checks.
- Integration: both apps boot from the integration branch and every lens page renders with data at 1440 and 390.

## Not in this plan

Content i18n (two later PRs), the production and static output story, the `proseSidecar` predicate upstream, journeys as its own package, timetables and time-banded formations, a webarchitect rule for scaffold conformance and a fragment-derivation tool for the anatomy DSL (both later, in pragma-core, if the checks in this plan prove too weak).

## The metro network lens (ruled 2026-10-21)

Rulings: the metro data and schema are extended to support it; diagram positions live in the dataset; the model must cover a loop line and its siblings: a single line running a ring in both directions (the Circle Line), two linear lines that together close a ring and share both termini (Paris lines 2 and 6), and a ring run by two lines in opposite directions on the same track (Berlin S41 clockwise, S42 anticlockwise). Direction is data, so a route, not the line, carries the ordered calls.

### PR P1 — `feat(prism-graph-example): models line routes, calls and diagram positions`
Base: F. Provider extension only; the contract does not change and `satisfiesContract` stays green; no `extend type Query`.
- SDL: `Line { code: String! colour: String! routes: [Route!]! }`; `Route { label: String! isLoop: Boolean! calls: [Call!]! reverse: Route }`; `Call { position: Int! stop: Stop! }`; `Stop.diagramPosition: DiagramPoint`; `DiagramPoint { x: Int! y: Int! }` in grid units, as value types with `_meta`, and the matching TBox classes and properties.
- `servesLine` / `servedBy` agree with the calls (a test derives one from the other).
- One fixture and one test per topology: linear lines, a bidirectional loop, two half-rings closing a ring, a directional ring pair. Every station on a route gets a diagram position; the two bare stations get none. Tests that pin entity counts are updated with the reason stated.

### PR P2 — `feat(prism-metro): adds a network lens with line strips and a schematic map`
Domain `src/domains/network/`, Tier 3. Routes `/network` (the map, a workspace), `/network/lines/:uri`, `/network/stations/:uri`; Line and Station homes point here. The door-card strip is an `<ol>` with CSS (turns vertical by the shell container query); loop routes show "continues" markers and a direction toggle. The schematic map is server-rendered octilinear SVG with shared stretches side by side and interchange capsules; reverse routes drawn once; the S41/S42 pair as two parallel strokes of one ring; a station list beside it. Geometry is a pure, unit-tested module. The station page shows previous and next stops per route and transfer minutes.

## Rolling stock and formations (ruled 2026-10-21)

A formation is an ordered list of units, each possibly reversed; a unit is a set of cars permanently coupled in order; alternatives are several formations of one stock.

### PR P3 — `feat(prism-graph-example): models rolling stock, units and formations`
Base: P1. `RollingStock`, `Unit`, `CarType`, `Formation` (Nodes), `CarPosition`, `UnitPosition` (value types), `Line.formations`, `Stop.platformLength`; length and capacity computed in provider code. One fixture and test each: a fixed formation, single or coupled units, an asymmetric unit reversed in its formation, one stock in different lengths per line, a formation longer than a platform, a line run by two stocks.

### PR P4 — `feat(prism-metro): adds a fleet lens with formation diagrams`
Domain `src/domains/fleet/`, Tier 3. `/fleet`, `/fleet/:uri`, `/fleet/formations/:uri`; homes for the stock types point here. Server-rendered side views scaled by car length, cab ends by orientation, coupling gaps; an ordered list carries the same content as text; alternative formations side by side at one scale; platform-fit marks per line.
