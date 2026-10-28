# @canonical/prism-core

The provider-neutral core of a Prism documentation site. A Prism site is a
set of lenses over one knowledge graph: each lens is a domain with its own
routes and page layout, and every lens reads the graph through Relay. This
package holds the parts every such site needs and none of them owns:

- **Lens chrome**: the two page archetypes every lens layout is built on,
  `WorkspaceLayout` and `DocumentLayout`, the components they place —
  `Rail`, `ModeStrip`, `LensBreadcrumbs` (with `makeLensContext`),
  `Canvas`, `CanvasSkipLink`, `ThemeSelector` — and the wrappers every page
  needs, `ErrorBoundary` and `ClientOnly`.
- **MentionChip**: the inline mention of a graph entity, tinted by its
  namespace, shaped by its kind, filled or outlined by class vs instance,
  and dotted by lifecycle; `ChipLegend` explains the grammar.
- **Well geometry**: the pure, deterministic layout functions a graph well
  settles its nodes and edges with (`relaxBoxes`, `findEdgeEndpoint`,
  `buildQuadArc`, `buildSelfLoop`, `settle`).
- **Homes**: where each kind of graph node lives (`HomesProvider`,
  `useHome`), so a mention of a node links to the page that owns it.
- **Entity bindings**: which GraphQL type serves each ontology class
  (`defineBinding`), checked against the schema (`assertBindings`) and the
  running graph (`assertBindingsLive`).
- **Route facets**: typed annotations a route carries on its `meta` bag, and
  the walk that reads them back off a route table. A lens declares itself
  with `routeLensFacet` on its index route, and claims a keyboard shortcut
  with `routeShortcutFacet`.
- **The static router**: `createStaticRouter`, a server-positioned router for
  server-side rendering and for tests.
- **Relay plumbing**: `createEnvironment` over the graph's endpoint, the
  prefetch slot a route's `warm` fetches into (`prefetchQuery`), and the
  server's data prepare step (`prepareRelayData`).

The package renders no brand, names no provider and selects no graph field:
the site supplies its route table, its brand and its data.

## Installation

```bash
bun add @canonical/prism-core
```

Requires React 19 and `@canonical/router-core` / `@canonical/router-react`.

## Lens chrome

A site renders one grid: its shell's root carries the `grid intrinsic`
classes of `@canonical/styles` and is the one query container, named
`shell`. Every layout below it is a subgrid of that grid, so every page
reads against the same columns. A lens layout is one of two archetypes,
each a subgrid over every column:

- `WorkspaceLayout`: a page that fills the viewport and never scrolls. The
  rail takes the first two columns, the strip the rest of the top row, the
  canvas the body, and an `inspector` the last three columns of the body;
  the rail and the inspector scroll on their own. Below three groups of
  columns the inspector moves into the published `SidePanel` drawer, which
  a trigger at the canvas's corner opens.
- `DocumentLayout`: a page whose canvas is the one scrolling region, with
  an optional `aside` and an optional `colophon` band under the body. The
  aside is the canvas's own: it holds the last three columns inside the
  canvas's scroll, starting at the top of the page and scrolling with it,
  and below two groups of columns it moves under the page. A page that
  lays a collection on the page grid, such as a catalog's cards, gives
  each item `CANVAS_PAGE_TILE_CLASS_NAME`: the canvas spans each tile over
  two columns, and over the whole row below one group of columns, where
  the canvas holds three.

Each archetype's gap is the grid's gutter on both axes, so its rows sit one
gutter apart. A region given a node that renders nothing (`null`, a
boolean or the empty string) is left out, as if the prop were omitted.

```tsx
import {
  collectLenses,
  DocumentLayout,
  ModeStrip,
  Rail,
} from "@canonical/prism-core";
import { useRouter } from "@canonical/router-react";
import type { ReactNode } from "react";

export function GlossaryLayout({ children }: { children: ReactNode }) {
  const { routes } = useRouter();
  return (
    <DocumentLayout
      rail={
        <Rail brand={{ label: "Atlas", to: "home" }} entries={collectLenses(routes)}>
          {/* the site's utility cluster */}
        </Rail>
      }
      strip={<ModeStrip context={<GlossaryContext lensLabel="Glossary" />} />}
    >
      {children}
    </DocumentLayout>
  );
}
```

Both render the skip link first (the published `SkipLink`, pointed at the
canvas), then a `.rail` region, a `.strip` region and the `Canvas`. A
strip, an inspector, an aside or a colophon that renders nothing leaves no
region, and no row or gutter for it: a layout with no strip starts its
canvas at the viewport's top. Regions are placed by column count from the start and by
negative lines from the end, so they hold their places at any column
count, and below one group of columns the rail narrows to one column. The
bands, the `ModeStrip` and the colophon region, keep their columns but
bleed across the gutter to meet the rail's border, a negative inline
margin of one gutter compensated by the same padding, so their rules run
edge to edge while their content sits on the canvas's first column line.
A document's canvas bleeds the same way, so its scroll reaches the rail's
border: a band of the page that bleeds one gutter, such as a region's top
rule, is painted to the rail's border instead of being clipped by the
canvas's scroll.

The rail reads its lenses from the route table it is given and wires each
lens's shortcut key itself, showing each key as a `KeyboardKey`. It does
not place itself: a layout puts it in a region that spans the first two
columns and scrolls on its own. Its `children` render at its foot as the
site's utility cluster, styled from a class contract: a `p.utilities-label`
heading, a `ul.utilities` labelled by it, `a.item` links (a `span.icon`
plus a `span.label`, as a lens entry) and an `li.theme` cell that stretches
a control such as `ThemeSelector` to the rail's width and lets it shrink
with the rail. Below one group of columns the wordmark, labels, hints and
headings hide and the brand dot and the icons stay.

### Stylesheets

Each component imports its own stylesheet, so a bundler that handles CSS
imports needs no further setup. The rules sit in
`@layer ds.components.global`, so a site's `app` layer overrides them
without specificity games. Load `@canonical/styles` first; it declares the
layer order, the spacing shim and the grid presets the components read.

Every design decision is read through a component token declared on the
component's root (`--rail-gap`, `--mode-strip-divider-color`), bound to
the spacing shim (`--grid-gutter`, `--container-gap-*`,
`--component-padding-*`), to the semantic tier for colours and text styles,
to the density channel for the line unit, or to a literal where no token
exists; a site re-themes a component by overriding its tokens. Every grid
and subgrid sets its gap from `--grid-gutter`. A site puts its context and
density classes (`docs comfortable`) on the document. The container
queries read the `shell` container a site's shell names.

The stylesheets name no theme. The MentionChip's fallbacks are light values;
a site's dark theme (whatever class or query activates it) defines the
MentionChip's hooks: `--mention-chip-tint-l` and `--mention-chip-tint-c`
(every namespace tint's lightness and chroma),
`--mention-chip-fill-weight-instance` (an instance's fill, 15% by default),
and `--mention-chip-dot-canonical`, `--mention-chip-dot-beta` and
`--mention-chip-dot-deprecated` (the lifecycle dots). The site keeps an
instance's text-on-fill contrast at 4.5:1 or above for every hue at its
values; the light fallbacks are held to that floor here.

### Component checks

Every component folder carries an `anatomy.yaml` in the anatomy DSL, and
its stylesheet transcribes it. The experimental `@canonical/prism-core/testing`
subpath holds the checks the prism packages and apps run over their own
components: `assertAnatomy`, `assertStylesMatchAnatomy`, `assertScaffold`,
`assertStylesheets` and `listAnatomyFolders`. Its `testing/browser` subpath
holds the browser side the apps' layout suites share: `launchBrowser`,
`measurePage` and `measureLayout`, which read a page's grid, scroll model,
overflow and spacing. Both subpaths ship as TypeScript source and import
what only a test run needs, so a consumer installs those optional peer
dependencies itself: `@canonical/anatomy-dsl`, `@canonical/summon-core`,
`vitest` and `yaml` for `testing`, and `playwright` for `testing/browser`.

Every component has its stories; `bun run storybook` serves them.

## MentionChip

```tsx
<MentionChip
  href={href}
  kind="component"
  label="Button"
  prefixes={prefixes}
  uri="ds:global.component.button"
/>
```

`prefixes` is required: it is the site's namespace list, sourced from the
provider (`ontologies { prefix }`), never written by hand. A namespace's
place in the list picks its hue (golden-angle steps), so the same list
always tints the same way and appending a prefix keeps every earlier tint.
A chip's namespace is its URI's prefix unless `namespace` overrides it; one
outside the list gets a neutral tint. Lightness and chroma are shared by
every hue behind `--mention-chip-tint-l` and `--mention-chip-tint-c`, so
text-on-fill contrast holds at AA for every hue at once.

The chip knows no routes: pass `href` (the noun's canonical home, which the
site resolves) to render a link, or leave it out to render inert text.

## Route facets

```ts
import { route } from "@canonical/router-core";
import { routeLensFacet, routeShortcutFacet } from "@canonical/prism-core";

export const glossaryRoutes = {
  glossary: route({
    url: "/glossary",
    content: GlossaryPage,
    meta: {
      ...routeLensFacet.of({ label: "Glossary", icon: GlossaryIcon, order: 3, tier: 1 }),
      ...routeShortcutFacet.of("3"),
    },
  }),
} as const;
```

`collectLenses(routes)` returns the lenses in rail order and
`collectShortcuts(routes)` the key allocation. Both throw on a malformed or
conflicting declaration (two lenses with one `order`, two routes with one
key, a lens or a shortcut on a route taking params): the table is static
data, so pin both collections in the site's own route-table test and a bad
declaration cannot ship. `defineFacet` and `collectFacet` build a facet of
your own.

## Relay

A route warms the store from its `warm` hook; it never names a query in its
`meta`:

```ts
const glossaryTerm = route({
  url: "/glossary/:term",
  content: TermPage,
  warm: ({ term }) => prefetchQuery(termQueryNode, { term }),
});
```

`createEnvironment` takes the graph's address or a replacement fetch
function, never neither: there is no default endpoint, because only the site
knows where its graph lives.

```ts
const environment = createEnvironment({ graphqlUrl, records });
setPrefetchEnvironment(environment); // before the browser router is created
```

On the server, `prepareRelayData(url, graphqlUrl, options)` matches the URL,
awaits the matched route's `warm` against a fresh per-request environment and
returns `{ records }` to embed in the page, or `undefined` (logged) when there
is nothing to send or the graph failed. `options` carries the site's
`routes`, `middleware` and `notFound` route, and `headers`.

`headers` is the one per-request seam between a site and its provider: the
prepare step stamps its server traffic through it, and a request attribute
such as the reader's locale travels the same way. Do not reach the provider
through module state instead.

## Homes

A site declares one resolver per `__typename`, and `Node` as the fallback,
each building its href through the router so it follows the route table:

```tsx
const homes: Homes = {
  Station: (node, router) =>
    router.buildPath("stationsEntity", { params: { uri: node.uri } }),
  Node: (node, router) =>
    router.buildPath("definitionsTerm", { params: { term: node.uri } }),
};

<HomesProvider homes={homes}>
  <Outlet />
</HomesProvider>;
```

`useHome(node)` returns the node's href, or `undefined` when neither its
type nor `Node` has a resolver. Mount `HomesProvider` inside the router and
above all routed content: `useHome` throws without one, because a missing
provider is a wiring bug, not a node without a home.

A home is an ordinary href, so a component that renders it through a plain
`<a>` loads the destination as a document. Hand such a component
`RouterLink` as its `LinkComponent` (for the projections,
`<ProjectionsProvider LinkComponent={RouterLink}>`) and a plain click on a
path of the site (an href that starts with `/` and that the browser resolves
to the page's own origin) that a route matches navigates on the client,
while hovering it warms the destination. Any other href (an absolute or
protocol-relative URL, a path that hides another host such as `/\host/path`,
a relative href such as `#part`, a path no route matches), a modified click,
and a link with a `target` or `download` stay the browser's.

## Entity bindings

```ts
export const station = defineBinding({
  id: "station",
  classUri: "metro:Station",
  typename: "Station",
});
```

`defineBinding` keeps `id` a literal type (`"station"`), so code built on a
binding can derive names from it. Check the bindings in two places:

- in the site's `check` script, `assertBindings(sdl, bindings)` parses the
  provider's schema and throws, naming the binding, when an id repeats or a
  type is missing or does not implement `Node`;
- at boot, `await assertBindingsLive(execute, bindings)` asks the running
  graph for every binding's class and throws when the graph does not know
  one.

## Strings

Every string the components show a reader (the skip link, the rail's and
the theme control's names and options, the chip legend's copy, the lifecycle
folded into a chip's description) comes from one English catalog,
`src/lib/i18n/constants.ts`. Each component reads its strings through the
translator an internal React context holds, whose default is
`@canonical/i18n-core`'s `createTranslator("en", …)` over that catalog: no
component holds a literal, and a placeholder with no value stays verbatim
rather than breaking a render. Because the translator comes from context,
a request-scoped locale reaches the components by providing that context,
with no module state and no change to a component; the package does not
export that provider yet. Until then, `Rail` and `ThemeSelector` take an
`aria-label` that replaces their default name.

A lens's own name is the site's string, not the package's: the `Context`
component `makeLensContext` builds takes the lens crumb's text as its
`lensLabel` prop, so a layout gives it at render time, read through the
site's own catalog, and the factory holds no reader-facing string.

## Consumer obligations

- Mount `HomesProvider` above routed content.
- Pass `prepareRelayData` the site's `routes`, `middleware` and `notFound`,
  and stamp per-request attributes through `headers`, never module state.
- Source `MentionChip`'s `prefixes` from the provider's `ontologies { prefix }`.
- Define the MentionChip's hooks in a dark theme (see Stylesheets).
- Run `assertBindings` in a `check` script and `assertBindingsLive` at boot.

## Public API

- Layouts: `WorkspaceLayout`, `DocumentLayout`; types
  `WorkspaceLayoutProps`, `DocumentLayoutProps`.
- Components: `MentionChip`, `ChipLegend`, `Canvas`, `CanvasSkipLink`,
  `CANVAS_PAGE_TILE_CLASS_NAME`, `ClientOnly`, `ErrorBoundary`, `LensBreadcrumbs`, `makeLensContext`,
  `ModeStrip`, `Rail`, `ThemeSelector`; types `MentionChipProps`,
  `ChipLegendProps`, `Kind`, `Box`, `Lifecycle`, `CanvasProps`,
  `CanvasSkipLinkProps`, `ClientOnlyProps`, `ErrorBoundaryProps`,
  `LensBreadcrumbsProps`, `LensContextProps`, `ModeStripProps`, `RailProps`, `RailBrand`,
  `ThemeSelectorProps`.
- Well geometry: `settle`, `findEdgeEndpoint`, `relaxBoxes`,
  `buildQuadArc`, `buildSelfLoop`; types `WellBox`, `WellPoint`,
  `RelaxOptions`, `QuadArc`.

- Facets: `defineFacet`, `collectFacet`, `routeLensFacet`, `collectLenses`,
  `routeShortcutFacet`, `collectShortcuts`; types `RouteFacet`, `RouteMeta`,
  `FacetBearer`, `LensEntry`, `LensTier`, `CollectedLens`,
  `ShortcutAllocation`.
- Router: `createStaticRouter`.
- Links: `RouterLink`; types `RouterLinkProps`.
- Homes: `HomesProvider`, `useHome`; types `Homes`, `HomeResolver`,
  `HomeNode`, `HomesProviderProps`.
- Bindings: `defineBinding`, `assertBindings`, `assertBindingsLive`; types
  `EntityBinding`, `GraphQLExecute`.
- Relay: `createEnvironment`, `getPrefetchEnvironment`,
  `setPrefetchEnvironment`, `prefetchQuery`, `prepareRelayData`; types
  `CreateEnvironmentOptions`, `PrepareRelayDataOptions`, `PreparedRelayData`.
