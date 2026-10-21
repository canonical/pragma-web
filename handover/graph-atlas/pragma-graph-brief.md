# pragma knowledge graph — what the embedded snapshot holds

Install: `pragma` 0.43.0 built from `/home/user/pragma-core` (`bun install` ran the Lerna build of all 22 packages), linked at `/root/.local/bin/pragma`. Store: embedded snapshot, created 2026-09-30, content hash `e63e7a6e…`. Runs offline, no `sources update` needed. `pragma doctor`: 6 passed, 0 failed.

## Size

| Measure | Value |
|---|---|
| Triples | 65,298 |
| Entities (IRI subjects) | 4,377 |
| Blank-node subject triples | 34,919 |
| Literal objects | 25,350 |
| Named graphs | none (one default graph) |

Triples by subject namespace: `dt:` 21,422 · `ds:` 6,753 · `cs:` 1,330 · `anatomy:` 874 · the rest are blank nodes.

## Packs (sources)

1. `@canonical/design-system` 0.43.0 — `ds:` ontology, blocks, tiers, modifiers, concepts, tags.
2. `@canonical/anatomy-dsl` 0.43.0 — `anatomy:` ontology, 111 style keys.
3. `@canonical/token-ontology` 0.43.0 — `dt:` and `w3c-tokens:` ontologies, the tokens.
4. `@canonical/code-standards` 0.43.0 — `cs:` ontology, 147 standards.
5. `@canonical/ds-implementations` git 3828317 (from pragma-web) — 94 implementation objects.

## Prefixes

rdf, rdfs, owl, xsd, skos, sh, dcterms, `ds:` https://ds.canonical.com/, `anatomy:` https://anatomy.canonical.com/, `dt:` https://dt.canonical.com/, `w3c-tokens:` https://dt.canonical.com/w3c-tokens/, `dt-web:` https://dt.canonical.com/platform/web/, `cs:` http://pragma.canonical.com/codestandards#, `graphql:`.

## Instances per class (largest first)

dt:Declaration 1,904 · w3c-tokens:Token 1,311 · dt:ResolvedValue 1,237 · dt:Variable 1,156 · ds:TokenBinding 1,010 · dt:TokenSymbol 745 · ds:Property 727 · cs:CodeStandard 147 · ds:Component 139 · anatomy:StyleKey 111 · ds:Subcomponent 95 · ds:ImplementationObject 94 · ds:Pattern 63 · w3c-tokens:Group 56 · w3c-tokens:File 45 · ds:Tag 44 · w3c-tokens:ResolverContext 44 · ds:ChangeLogEntry 43 · dt:Coordinate 36 · sh:NodeShape 33 · ds:Modifier 33 · dt:Condition 31 · cs:Category 21 · ds:Tier 16 · ds:Layout 16 · ds:Concept 13 · ds:ModifierFamily 11 · dt:Contract 9 · ds:Group 9 · ds:TagCategory 8 · ds:ConceptType 4 · ds:ImplementationLibrary 4 · dt:Tier 3 · ds:View 2 · ds:Variant 1.

Ontology schema itself: 63 owl:Class, 82 DatatypeProperty, 77 ObjectProperty, 33 SHACL node shapes, 5 owl:Ontology.

## Design system (`ds:`)

- **Blocks: 313** across 16 tiers (139 components, 95 subcomponents, 63 patterns, 16 layouts). Every one has an anatomy DSL. `block list` shows 176 in the five top-level tiers.
- **Tiers (16):** global, apps, sites, stores, documentation, plus apps_{anbox, debcrafters, juju, lxd, landscape, launchpad, notary, portal, support, workplaceengineering} and sites_webcomponentsprototype. Lower tiers inherit from ancestors.
- Biggest tiers by block count: global 122, launchpad 46, landscape 44, apps 39, sites 14, webcomponentsprototype 13.
- **Modifier families (11):** Importance, Anticipation, Criticality, Density, Lifecycle, Mode, Release, Surface, plus (Emphasis), (Color luminosity), (Other). 33 modifier values. Only 7 `hasModifierFamily` edges exist (Button, Badge, …), so family declaration on blocks is sparse.
- **Properties: 727** (text 180, boolean 130, choice 71, callback 64, node 64, number 42, object 40, …).
- **Concepts: 13** (8 Explanation, 5 How-to guide; Reference and Tutorial types empty): Foundations (Baseline, Density, Grid & Layout, Spacing ×2, Surfaces, Typography), modifier contract, intentional friction, required fields, UI-block differentiation, question-mark vs info icon.
- **Groups (9):** Buttons, Cards, CodeSnippets, KeyboardKeys, Tiles, KeyValuePairs, Notifications, BlogCards, XBlogElements. **Views (2):** SettingsView, NetworkTopology. **Variant (1):** Tooltip+Dense.
- **Tags (44)** on 8 categories: lifecycle (draft, candidate, beta, stable, edge), triage (`needs:*`, `triaged:*`, `lp:triage:*`), dev progress (`dev:react:*`, `dev:svelte:*`, `dev:batch*`). Documentation stage: needs:definition 98, special:adoption-docs 45, needs:triage 42, needs:documentation 26.
- **Change log: 43** blank-node entries (timestamp, change text, changeType change|decision).

## Token bindings (anatomy ↔ tokens): 1,010

Each binding = block + anatomy node + style key + state + consumed `dt:` symbol. States: default 789, disabled 71, focus 50, hover 42, invalid 20, selected 18, indeterminate 12, active 8. Heaviest consumers: Button 144, FieldLabel 64, CheckboxInput 60, ComboboxInput 50. Most-consumed symbols: dimension.200 (99), color.text (90), dimension.100 (61), color.text.muted (50), stroke.thickness.medium (45), color.border (44).

## Anatomy (`anatomy:`)

Classes: Specification, Node (Named/Anonymous), Edge, Relation, Style, StyleKey, Prop, Projection, Switch, SwitchCase. **111 style keys** in facets appearance.*, layout.*, size.*, spacing.*, typography.*, motion.*, interaction.*, each typed primitive | token | either, with allowed token namespaces (color., dimension., motion., plus modifier.* and surface.* variants).

## Tokens (`dt:` / `w3c-tokens:`) — the largest third of the graph

- **745 TokenSymbols** (color 473, number 115, dimension 91, typography 29, fontWeight 8, fontFamily 4) declared by **1,311 Token** definitions in **45 DTCG files** (light/dark semantic colour 354 each, primitive colour 119, number 115, dimension 79, then modifier files per family: typography, surface, spacing, criticality, emphasis, anticipation, release, lifecycle).
- **1,156 Variables** (CSS custom properties for platform web, IRIs `dt:s4/web/--…`): tiers semantic 617, primitive 493, derived 46; visibility public 1,082, internal 74.
- **1,904 Declarations** (variable × where it is emitted), **1,237 ResolvedValues** with resolution chains, **36 Coordinates** (mode light/dark/indeterminate; importance; anticipation; criticality; emphasis incl. branded; lifecycle; release; surface none/layer1-3/modal/contrasted), **9 Contracts** (anticipation, criticality, emphasy, importance, lifecycle, product, release, surface, theme), 31 Conditions, 6 Derivations.
- `rdf:first/rest` lists (3,117 each) are mostly `dt:references` (1,158) and `dt:resolutionChain` (1,072).

## Code standards (`cs:`): 147 standards, 21 categories

react 16, css 15, svelte 15, lit 13, rust 11, storybook 11, code 10, ui-blocks 9, icons 8, testing 8, git 7, packaging 7, ui-blocks-nojs 6, webcomponents 6, styling 4, turtle 4, tsdoc 3, testing-unit 3, testing-coverage 2, testing-integration 1, testing-regression 1. Each has description, category, optional `extends`, and Do/Don't examples (291 do, 284 don't) with language and code.

## Implementations: 94 objects, 4 libraries

@canonical/react-ds-global 41 · @canonical/react-ds-global-form 41 · @canonical/ds-types 8 (modifier-family constants) · @canonical/svelte-ds-global 4. All at 0.42.0, each with head link, versioned link, implementsBlock, and 40 with import statements. **31 global components/patterns/layouts have no implementation yet** (Table, Pagination, Navigation, Stepper, Tag, Avatar, NotificationToast, SearchField, …).

## Empty surfaces

`prompt list` → 0 prompts. `graph query` on `GRAPH ?g` → nothing (single default graph). Skills: 9 bundled (add-standard, adoption-a1/a2/a3, anatomy-author, design-auditor, implement-component, specify-component, specify-pattern).

## Handy queries

```bash
pragma graph query "SELECT (COUNT(*) AS ?n) WHERE { ?s ?p ?o }"
pragma graph query "SELECT ?c (COUNT(?s) AS ?n) WHERE { ?s a ?c } GROUP BY ?c ORDER BY DESC(?n)"
pragma block list --tier all --format llm
pragma block lookup Button
pragma token consumers color.text
pragma graph connect ds:global.component.button dt:color.background
pragma graph inspect ds:global.component.button
```
