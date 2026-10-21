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

## Public API

- Facets: `defineFacet`, `collectFacet`, `routeLensFacet`, `collectLenses`,
  `routeShortcutFacet`, `collectShortcuts`; types `RouteFacet`, `RouteMeta`,
  `FacetBearer`, `LensEntry`, `LensTier`, `CollectedLens`,
  `ShortcutAllocation`.
- Router: `createStaticRouter`.
