# @canonical/prism-core

The provider-neutral core of a Prism documentation site. A Prism site is a
set of lenses over one knowledge graph: each lens is a domain with its own
routes and page layout, and every lens reads the graph through Relay. This
package holds the parts every such site needs and none of them owns:

- **Lens chrome**: the components a lens layout composes — `Rail`,
  `ModeStrip`, `LensBreadcrumbs` (with `makeLensContext`), `Canvas`,
  `CanvasSkipLink`, `ThemeSelector` — and the wrappers every page needs,
  `ErrorBoundary` and `ClientOnly`. There is no shared frame: each lens's
  layout arranges these as it needs.
- **Chip**: the inline mention of a graph entity, tinted by its namespace,
  shaped by its kind, filled or outlined by class vs instance, and dotted by
  lifecycle; `ChipLegend` explains the grammar.
- **Well geometry**: the pure, deterministic layout functions a graph well
  settles its nodes and edges with (`relaxBoxes`, `edgeEndpoint`, `quadArc`,
  `selfLoop`, `settle`).
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

```tsx
import {
  Canvas,
  CanvasSkipLink,
  collectLenses,
  ModeStrip,
  Rail,
} from "@canonical/prism-core";
import { Outlet, useRouter } from "@canonical/router-react";

export function GlossaryLayout() {
  const { routes } = useRouter();
  return (
    <div className="glossary-layout">
      <CanvasSkipLink />
      <Rail brand={{ label: "Atlas", to: "home" }} entries={collectLenses(routes)}>
        {/* the site's utility cluster */}
      </Rail>
      <ModeStrip context={<GlossaryContext />} />
      <Canvas>
        <Outlet />
      </Canvas>
    </div>
  );
}
```

The rail reads its lenses from the route table it is given and wires each
lens's shortcut key itself. Its `children` render at its foot as the site's
utility cluster, styled from a class contract: a `p.rail-util-label`
heading, a `ul.rail-utilities` labelled by it, `a.rail-item.rail-util`
links (icon plus `span.rail-label`) and an `li.rail-theme` for a control
such as `ThemeSelector`.

### Stylesheets

Each component imports its own stylesheet, so a bundler that handles CSS
imports needs no further setup. The rules sit in `@layer ds.prism`: below a
site's own `app` layer, above `ds.components.global`, so a site overrides
them without specificity games. Load `@canonical/styles` first; it declares
the layer order.

The stylesheets read the site's layout tokens and fall back when a site
does not define them: `--strip-h` (the strip's height), `--z-plate`,
`--z-chrome` and `--z-overlay` (the z-axis strata) and `--rail-span` (the
rail's column span over the layout's `--grid-intrinsic` columns).

## Chip

```tsx
<Chip
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
every hue behind `--chip-tint-l` and `--chip-tint-c`, which the dark theme
redefines, so text-on-fill contrast holds at AA for every hue in both
themes.

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

## Consumer obligations

- Mount `HomesProvider` above routed content.
- Pass `prepareRelayData` the site's `routes`, `middleware` and `notFound`,
  and stamp per-request attributes through `headers`, never module state.
- Source `Chip`'s `prefixes` from the provider's `ontologies { prefix }`.
- Run `assertBindings` in a `check` script and `assertBindingsLive` at boot.

## Public API

- Components: `Chip`, `ChipLegend`, `Canvas`, `CanvasSkipLink`, `ClientOnly`,
  `ErrorBoundary`, `LensBreadcrumbs`, `makeLensContext`,
  `ModeStrip`, `Rail`, `ThemeSelector`; types `ChipProps`,
  `ChipLegendProps`, `Kind`, `Box`, `Lifecycle`, `CanvasProps`,
  `CanvasSkipLinkProps`, `ClientOnlyProps`, `ErrorBoundaryProps`,
  `LensBreadcrumbsProps`, `ModeStripProps`, `RailProps`, `RailBrand`.
- Well geometry: `settle`, `edgeEndpoint`, `relaxBoxes`, `quadArc`,
  `selfLoop`; types `WellBox`, `RelaxOptions`, `QuadArc`.

- Facets: `defineFacet`, `collectFacet`, `routeLensFacet`, `collectLenses`,
  `routeShortcutFacet`, `collectShortcuts`; types `RouteFacet`, `RouteMeta`,
  `FacetBearer`, `LensEntry`, `LensTier`, `CollectedLens`,
  `ShortcutAllocation`.
- Router: `createStaticRouter`.
- Homes: `HomesProvider`, `useHome`; types `Homes`, `HomeResolver`,
  `HomeNode`, `HomesProviderProps`.
- Bindings: `defineBinding`, `assertBindings`, `assertBindingsLive`; types
  `EntityBinding`, `GraphQLExecute`.
- Relay: `createEnvironment`, `getPrefetchEnvironment`,
  `setPrefetchEnvironment`, `prefetchQuery`, `prepareRelayData`; types
  `CreateEnvironmentOptions`, `PrepareRelayDataOptions`, `PreparedRelayData`.
