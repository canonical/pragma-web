# The fleet lens: the decisions taken while building it

# P4 decisions taken without the parent

Phase 1 (planning)

1. **Shim symbols in anatomies** are the custom properties in dotted spelling (`container.gap.default`, `component.padding.inline`, `grid.gutter`). The S2 plan was not available; `anatomy-dsl check` accepts them. Rename mechanically if S2 fixed another spelling.
2. **The side view is SVG painted with `currentColor`.** The style-key roster has no `fill` or `stroke` key, so no stylesheet can bind SVG paint under the anatomy rule. Colour is bound through `typography.color` on each painted group, with `fill`/`stroke="currentColor"` in the markup (the icon convention, cs:icons.svg.color_usage).
3. **One scale through a shared viewBox width.** Every drawing in one context uses the same viewBox width (the longest train or marked platform), and the SVG fills its column, so trains compare at one scale with no inline sizes.
4. **Coupling and gangway gaps are drawn inside the cars' lengths**, so a drawn train ends at its exact length.
5. **Front of the train at the inline start (left).** A cab facing the front gets its nose on the left.
6. **Homes only for RollingStock and Formation.** The plan's three routes show no unit or car type on its own, so `Unit` and `CarType` mentions read as text, as a fare zone's do.
7. **Fleet lens order 5, tier 3**, leaving 4 to the network lens (P2).
8. **Address expansion reuses the entity lens's `expandAddress` and `readUriParam`**, exported from `@canonical/prism-lens-entity`'s barrel, rather than copying them; the fleet domain declares its own namespaces query because the app cannot import a package's compiled operation.
9. **All five representations per fleet type** (20 projections), following S5's rule, unless S7 shipped fewer for the metro types.
10. **Side-view data through `@inline` fragments** (`readFormationTrain_formation`, `readUnitTrain_unit`) read by pure mapping functions, so `FormationSideView` itself takes plain props and has no fragment.
11. **No type-size bindings.** Hierarchy comes from the elements under the `.docs` context.
12. **Repository rules.** The user first asked for pragma-web's AGENTS.md as it stood before #1409, then asked for the brief to be followed, with a reconciliation later. So the brief governs: the branch `claude/prism-p4-metro-fleet`, the worktree `../worktrees/p4-metro-fleet`, and merge commits. The old AGENTS.md rules that don't conflict with the brief also apply: the React props rules (including the reordered spread in the relay scaffold), the root gate, the PR mechanics (drive-by line, PRs named by number, `Chromatic: skip`) and the dependency direction.

Phase 2, part A (implementation on `claude/prism-p4-metro-fleet` from `claude/prism-p3-metro-stock`)

13. **Relay artifacts stay generated and ignored**, the metro app's own convention (the parent corrected an earlier commit that had committed them, docs-site style). `check` runs `schema:check`, then `relay`, then `tsc`; `build` runs `relay` before the client build; app code imports artifacts through `#relay/__generated__/*`.
14. **Routes, homes and the route table wait for part B.** A route needs its page as content, and the pages need S2's layouts and S3's components, so no route was added with an empty page. The domain barrel exports the warm functions for now; the lens's facet values are in `FLEET_LENS`.
15. **The page queries select their fields inline for now.** Part B replaces those selections with the projections' fragment spreads.
16. **`FormationSideView` draws one train per figure** and takes an optional `scale`, so the stock page stacks several at one scale. Its anatomy in the component folder supersedes the plan's section 1.2.
17. **Scaffold adjustments:** the stories file is dropped (the metro app has no Storybook, so it would break `tsc`); tests are renamed to `*.tests.tsx`; the generator's `ds.components.global` layer is kept.
18. **Commit trailer:** `Claude-Session` names this session, as the harness's attribution says, not the parent session the brief names.
19. **Data corrections:** the six-car runs on the Coastal and the North Lines. On the North Line it overhangs only Marsh End, by 20 m. The plan is corrected.
20. **`relay-test-utils` is deferred to part B**, where the `--relay` scaffolds' tests need it. Part A tests Relay against the metro provider executed in process.

Rulings from the user, relayed by the parent before part B

21. **The address-helpers export is its own PR**, #1512 (https://github.com/canonical/pragma-web/pull/1512), branch `claude/prism-lens-entity-address-helpers` from `origin/claude/prism-integration`, against `claude/prism-integration`. The commit stays on the fleet branch too, and the merge dedupes it. The fleet PR names #1512 as a PR that must land first, in place of a drive-by line.
22. **Stories stay; every app has a Storybook.** S2b adds the metro app's `.storybook/` from `@canonical/storybook-config` (with the Relay addon, as pragma-docs has it), and S7 carries it. In part B, after the merge, `FormationSideView` gets back its scaffolded stories file, and every new component keeps its own. All stories run in the app's Storybook with the boilerplate titles. This reverses decision 17's drop of the stories file.
23. **Every design decision in a stylesheet reads a component token** declared on the component's root class (never `:root`), bound to a semantic token or a shim symbol. This applies to every value, not only reused ones. Part B rewrites `FormationSideView`'s `styles.css` that way (`--formation-side-view-gap`, `--formation-side-view-train-color` and so on, on `.ds.formation-side-view`) and binds the anatomy to those tokens.
24. **Grids and subgrids gap with `--grid-gutter` on both axes, through their component token.** No `--container-gap-*` on a layout container; larger block separations are external spacing on the item. In part B: `FormationSideView`'s grid root, the FleetIndex, StockPage, FormationPage and PlatformFit grids, and the side view's text list re-bind `spacing.gap` to the gutter via their tokens. The `container.gap.loose` separations in the page anatomies become `spacing.external.block.start` on the section items.
25. **`EntityCard` gains an optional `sidecar` slot per entity type.** The fleet cards use it: RollingStockCard, FormationCard and UnitCard put the side view in `sidecar` rather than `preview`, so the preview slot stays free. CarTypeCard has no sidecar. The card anatomies move their `metro.fleet.formation-side-view` edge from `slotName: preview` to `slotName: sidecar` in part B, once S3's anatomy names the slot.

Part A2 (merge of S2b, the layout, the pages, the facts, the platform fit)

26. **The merge of S2b kept both provider extensions.** The graph-example's Prose (from S2's stack) and the network and fleet models (P1, P3) conflicted in five files. Both sides are kept everywhere. `prose` moved to `ExampleEntityBase`, since P3 split `ExampleEntity` into a union. The app's schema was regenerated with `bun run schema`. `bun.lock` came out identical to S2b's after two pinned installs.
27. **The projections' 20 anatomies are parked** in `/home/user/forge-output/P4/anatomies/` until part B. S2's app test requires a scaffolded component beside every `anatomy.yaml`, and the projections are scaffolded with `--relay` in part B.
28. **Fleet lens tier 2, not "3".** `LensTier` is `1 | 2`; the lens selects provider-extension types, which is tier 2.
29. **The aside reads its facts from the page's own operation.** `FleetLayout` reads the route, and `FleetFacts` reads the same operation through `useFleetNode`, so a server-rendered page answers both from the store. No layout in the codebase passed a page-specific aside before. This follows `EntityLayout`'s status socket.
30. **Pages for units and car types** (`/fleet/units/:uri`, `/fleet/car-types/:uri`), as part A2 asked, so decision 6 is superseded: all four fleet types have homes.
31. **The bar's bleed lives in `FleetLayout`**: `.ds.fleet-layout .bar`, with the ModeStrip given the `bar` class, a negative inline-start margin of one gutter and padding grown by the same gutter, both through tokens. If S2's fifth round bleeds the strip in core, this rule is dropped on the merge in part B.
32. **Placeholders** are marked with `data-placeholder`: `entity-list` on the index's list, `entity-card` on each stock (its side views in a `.sidecar`), `entity-row` and `entity-chip` where a node's row or chip goes. Until then, nodes are named by `NodeLink`, a styleless link to the node's home.
33. **Page queries select every field inside the type condition**, so Relay types the answer as a union narrowed on `__typename`. `assertFragment` asserts an aliased spread's key, which Relay types as nullable.
34. **Story data are recorded answers** in `.storybook/mocks/fleetResponses.ts`, because the example provider is Node-only. `src/testing/integration/fleetStoryResponses.tests.ts` holds them equal to the live provider.
35. **The app's stylesheet rules now also run over each domain library**, not only `src/lib/ui`, with the semantic tokens the fleet reads named as external tokens.
36. **Not yet done, deferred to part B:** the e2e cases and the server's 404 for an address naming nothing (the pages already say so with `role="status"`).

Part B (merges of S7, S4 and #1512; projections; the swap)

37. **Merges.** S7, S4 and #1512 came in with merge commits. S7's side was taken for the graph example, `lens-entity`, the scripts, `.gitignore` and the schema; S4's `EntityGraphNode`, with S7's identifier slot re-applied. S4's height for graph nodes clashed with the native SVG `height` in S7's types, so `height` is lifted into own props beside `width` in the metro graph-node types, the site slot and the projections package's graph-node types.
38. **The fleet's words go through S7's catalog hook.** `useMessages()` replaces `formatMessage`; the counts are plural records (`fleet.formations.count` and the rest).
39. **Twenty projections, written from one table.** RollingStock, Formation, Unit and CarType each have Card, Row, Chip, Command and GraphNode in `src/domains/fleet/lib`, scaffolded with `--relay` and written in S7's Line/Station pattern: generic Entity components, `useHome`, `useProjectionLink`, the empty scaffolded `styles.css`, `*.tests.tsx`, the SSR test and the stories. The cards put the side view in `sidecar`: the stock's card draws every formation at one scale (`FormationStack`, new), and the formation's and the unit's draw the train. CarTypeCard has no sidecar, per the ruling in decision 25; the car type's page draws the car. Range values are read by `describeRange`, pulled out of `listFleetFacts`.
40. **The metro site slots arm the fleet types.** Each `Site<Form>Slot` spreads the four fleet fragments and switches on them, each dispatcher's anatomy lists the cases, and `metroProjectionMaps` lists the four types under `siteTypes`. The metro domain imports them from the fleet's barrel (`#domains/fleet`); the fleet imports nothing from the metro domain, so there is no cycle.
41. **The landing gets a fourth door.** `HOME_LENS_MESSAGES.fleet`, the home query's `fleet: ontologyClass(uri: $fleetClass)` count, `readLensCounts` and `buildHomeVariables`. The Storybook mock of the landing's answer was already stale (seven classes against the provider's sixteen) and is re-recorded.
42. **The index is the shared list view.** `NodeList` over the rolling-stock instances, cards by default (their sidecars are the point of the lens), rows on `?view=rows`, the toggle writing the parameter back with `replace`. `readFleetView` copies the entity lens's `readEntityView`, which its barrel does not export.
43. **Nodes named inside a composite entry use the chip; plain lists use the row.** A row's root is an `<li>` with no room for a side view or a "reversed" flag, so the stock page names each formation by its chip above its side view, and the formation page names its stock, its units and each platform-fit line by their chips. The stock page's car types are rows, by name and length: a row's `location` is a namespace prefix glued to the title, so the car's code has no slot there; the codes read in each side view's text. `PlatformFit` stays plain-props and takes a `renderName` for the line's name after its code. `NodeLink` is gone.
44. **The bar's bleed is dropped** (decision 31): core's DocumentLayout and ModeStrip bleed the strip, so FleetLayout is styleless.
45. **The `common/` subcomponents got anatomies**, styleless, as S7's subcomponent check needs.
46. **No data-aware 404.** The server resolves a page's status from the route match before any data is read, for every lens: a malformed address (`/fleet/%ZZ`) answers 404, and the e2e cases cover it. A well-formed address naming nothing answers 200 with the page's `role="status"` line, as the entity lens does. A data-aware status is a server change for every lens, left as a follow-up.
47. **The Definitions e2e pattern accepts a fractional viewBox.** With the network and fleet classes in the ontology, the class graph's layout gives `688.33…`, valid SVG that S4's integer-only pattern rejected.
48. **The fleet index is a subgrid of the canvas**, as the entity index is, so the list view's cards bind to the canvas's columns; as a plain grid it gave the cards two tracks and they piled up in one cell.
49. **EntityCard stacks its sidecar on a phone's row** (a fix in `@canonical/prism-projections`). Below 448px the canvas holds three columns, and a card with a sidecar needed four, so the cards overlapped. The fleet's are the first cards with a sidecar. Every card now spans the row there; with a sidecar, the body takes the first two row tracks and the sidecar the third, meeting at the body's divider. Cards without a sidecar render as before.
50. **The side view's figure drops its default margins**, which indented every drawing by 40px on both sides.

Review loop (two rounds of a correctness reviewer and a design reviewer, with screenshots at 1440 and 390 in light and dark; a third check of my own)

51. **A stock with no formations** reads as its count alone (`describeFormations`): no ranges, no sidecar, and "No formation runs this stock." on its page, which also drops the car types. Before, the card's `FormationStack` threw and the error boundary hid the whole index.
52. **The stock page draws through `FormationStack`**, so its scale comes from the cars' lengths, the only measure the geometry trusts. Each train has a caption: its chip and length on the stock page, its title and length in the index sidecar. A loose step (`container.gap.default`) follows each train. The checker allows no `:last-child` state, so the last train keeps that trailing step too (leftover, cosmetic).
53. **Ranges read in the locale's form** through `Intl.NumberFormat.formatRange`: "60–120 m", "490–980 passengers". Measures that round alike read as one value.
54. **The side view's text list** drops the unit label for a single-unit train, and each car code is followed by a visually hidden description (", Series 90 driving motor car, cab at the front"), because screen readers do not read an `abbr` title.
55. **Platform fit** drops the bare line code, since the chip names the line. The verdict is bold, inline after the shortest platform: right-aligned verdicts detached from their lines on the phone and sat far from them on the desktop.
56. **Car type and unit pages** draw against `REFERENCE_TRAIN_LENGTH` (120 m), so a 20 m car no longer fills the column.
57. **The facts section renders only around facts**, so no heading or dangling `aria-labelledby` on a missing address.
58. **`/fleet` is in the sitemap.**
59. **Not taken:**
    - Labels under the platform marks are a leftover. SVG text would scale with the millimetre viewBox; HTML labels positioned by ratio would work, and the list below already states each shortest platform.
    - Heading sizes stay with the shared docs typography.
    - "Capacity" values wrapping in the narrow value column is a nit.
    - The content running to the right edge at 390 is the shared shell's, seen on the stations lens too.
