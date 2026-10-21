# @canonical/prism-core

The provider-neutral core of a Prism documentation site. A Prism site is a
set of lenses over one knowledge graph: each lens is a domain with its own
routes and page layout, and every lens reads the graph through Relay. This
package holds the parts every such site needs and none of them owns:

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

## Public API

- Facets: `defineFacet`, `collectFacet`, `routeLensFacet`, `collectLenses`,
  `routeShortcutFacet`, `collectShortcuts`; types `RouteFacet`, `RouteMeta`,
  `FacetBearer`, `LensEntry`, `LensTier`, `CollectedLens`,
  `ShortcutAllocation`.
- Router: `createStaticRouter`.
- Relay: `createEnvironment`, `getPrefetchEnvironment`,
  `setPrefetchEnvironment`, `prefetchQuery`, `prepareRelayData`; types
  `CreateEnvironmentOptions`, `PrepareRelayDataOptions`, `PreparedRelayData`.
