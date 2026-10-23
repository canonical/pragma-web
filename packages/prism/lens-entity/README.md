# @canonical/prism-lens-entity

The class-bound docs view of a Prism documentation site. For each class a
site binds, the lens gives two pages: an index of the class's instances in
the shared list view of `@canonical/prism-projections`, as rows or cards,
with a search over the loaded entries, and a page per instance with its
title, its definition and comment, its class, and the fields and the
relations its class declares, as key values on the page's grid.

The lens is **Tier 1**: its four operations (`EntityIndexQuery` and its
pagination query, `EntityNamespacesQuery`, `EntityPageQuery`) and their
fragments compile against `@canonical/prism-contract`'s SDL alone, so the lens
runs over any provider that conforms to the contract.

## Installation

```bash
bun add @canonical/prism-lens-entity
```

Requires React 19, Relay 21, `@canonical/prism-core`,
`@canonical/prism-projections`, `@canonical/react-head` and the router
packages `@canonical/router-core` and `@canonical/router-react`.

## Mounting the lens

A site declares a binding per class, creates the binding's two routes, and
groups them under a router wrapper of `EntityLayout`, binding its own rail
and colophon to the layout once:

```tsx
import { defineBinding } from "@canonical/prism-core";
import { createEntityRoutes, EntityLayout } from "@canonical/prism-lens-entity";
import { group, wrapper, type WrapperComponentProps } from "@canonical/router-core";
import type { ReactElement, ReactNode } from "react";

const stationsBinding = defineBinding({
  id: "stations",
  classUri: "metro:Station",
  typename: "Station",
});

const stationsRoutes = createEntityRoutes(stationsBinding, {
  label: "Stations",
  order: 1,
});

const SiteStationsLayout = ({ children }: WrapperComponentProps<ReactNode>) => (
  <EntityLayout
    binding={stationsBinding}
    colophon={<SiteColophon />}
    label="Stations"
    rail={<SiteRail />}
  >
    {children}
  </EntityLayout>
);

const stationsLayout = wrapper<ReactElement>({
  id: "stations-layout",
  component: SiteStationsLayout,
});

const [stations, stationsEntity] = group(stationsLayout, [
  stationsRoutes.stations,
  stationsRoutes.stationsEntity,
] as const);
```

The lens renders inside the site's provider nest: `HeadProvider`,
`RelayEnvironmentProvider`, `RouterProvider`, and inside the router
`HomesProvider` and `ProjectionsProvider`, which the index's rows and cards
and the page's title and class chip read their homes and arms from.
`EntityLayout` mounts the lens's own filter provider, shared by the strip's
search box and the index.

The layout is core's `DocumentLayout`, the document archetype: the site's
rail, the mode strip, the routed page in the canvas, the one region that
scrolls, and the colophon in the band under it. On the index the strip
carries the search box and the count of the entries shown. The layout
renders no element of its own; its native props reach the document layout's
root.

The index keeps its view in its route's `view` search parameter
(`/stations?view=cards`; the rows view, the default, carries none): the list
view's toggle writes it, replacing the history entry, so a view survives a
reload, travels with a link, and is the view the server renders. The index
route declares the parameter's search schema, so a site's register carries
the key.

On the server, a site prepares the store through each route's `warm`, which
fetches the route's operations into the published prefetch environment; the
page then renders from the warm store and hydrates without a second request.

## Route names your register must carry

The lens links by route name, so a site's route table keeps both routes of a
binding under the keys `createEntityRoutes` returns:

- `${id}`: `/${id}`, the lens index the rail and the breadcrumb link to;
- `${id}Entity`: `/${id}/:uri`, one instance, whose address is the compact
  form (`/stations/metro%3Anorthgate`) or the absolute IRI.

A binding `stations` therefore gives `stations` at `/stations` and
`stationsEntity` at `/stations/:uri`. The URL is the binding's id as
written, not a pluralisation, so a lower-camel-case id gives a camel-case
URL. The lens's links are typed by the site's `RouterRegister`, so a table
that renames either key fails the site's type check.

## Homes

The index links each entry to its home, and the projections hand a home the
node's `__typename` and its compact address (`_meta.curie`). A site declares
one home per typename the class's instances carry, including the typenames
of its subclasses: the metro graph serves an interchange, a station subclass,
as its own `Interchange` type.

```ts
const homes: Homes = {
  Station: (node, router) =>
    router.buildPath("stationsEntity", { params: { uri: node.uri } }),
  Interchange: (node, router) =>
    router.buildPath("stationsEntity", { params: { uri: node.uri } }),
};
```

## Addresses

`node(id:)` takes the absolute IRI and nothing else, while the homes build
links from the compact address. The entity route accepts both: it reads the
graph's prefixes and namespaces (`ontologies { prefix namespace }`, part of
the contract) and expands a compact address whose prefix the graph declares.
An address with an unknown prefix passes through unchanged, and the page
renders its not-found status. The namespaces lookup costs one extra request
on the first entity a reader opens; the store answers it after that.

## Bindings

A binding names the class a lens shows and the GraphQL type serving its
instances. Check it at three points:

- `defineBinding` where the binding is written: it asserts the shape and that
  the id is lower camel case, so the route names derived from it are valid;
  `createEntityRoutes` runs it again;
- `assertBindings(sdl, bindings)` in the site's `check` step, against the
  provider's schema: every type is declared and implements `Node`, and no id
  is used twice;
- `assertBindingsLive(execute, bindings)` at boot, against the running graph:
  the graph knows every class.

## What the entity page shows

- The entity's title as the page's heading over its compact address.
- Its definition and its comment, each when the graph asserts one.
- The class it is an instance of, mentioned through the site's chip
  projection.
- The fields its class declares, own and inherited, as key values: each
  field's name as the key, and as the value one sentence with the property it
  answers to and the range of its values in compact form, the property's
  kind and the field's cardinality.
- Its relations, as key values: each field of object kind, with the class
  its values belong to and its cardinality.

Every key starts on the main column's first line and every value on its
third; below two groups of columns a pair stacks, the key over the value.

An address nothing in the graph answers to, and a node that is not an
instance of the bound class or of one of its subclasses, render a not-found
status in the canvas.

The relations are the ones the class declares, not the entities this one is
related to. The contract's `_meta.fields` describes the class's schema and
holds no values, and no contract field returns the value of an arbitrary
field on an arbitrary entity: reading the nodes behind a field needs a
selection on the entity's concrete type, which a Tier-1 lens cannot write.

## Rail placement

Each index route declares its lens with the site's `order` and `tier: 1`, and
claims no shortcut. A site's lenses must claim distinct orders:
`collectLenses` throws on a duplicate.

## Building against the package

The package ships its TypeScript source and the Relay artifacts its `build`
script compiles against `@canonical/prism-contract`'s SDL into
`src/__generated__`. It imports those artifacts itself, so no Relay transform
runs over its files, and a site compiles nothing of the lens unless its own
documents spread a lens fragment.

The package's `relay.config.json` reads the projections package's fragments
as a base project, because the index spreads `RowProjection_node` and
`CardProjection_node` and the page `ChipProjection_node`; only
the lens's own artifacts land in `src/__generated__`. `check:tier1` runs
`relay-compiler --validate` against the contract SDL alone: it fails when a
selection leaves the contract and when the artifacts are stale. Run
`bun run relay` after editing a fragment.

## Styling

Every component sits in `src/lib/ui/`, scaffolded by the component
generator, and carries an `anatomy.yaml`: its slots and every style
decision, bound to a token. Its `styles.css` transcribes the anatomy, in the
`ds.components.global` cascade layer, and the package's tests check that it
does (`@canonical/prism-core/testing`).

Each design decision reads a component token declared on its component's
root class (`.ds.key-value-list { --key-value-list-rule-width: 1px; … }`),
never on `:root`, bound to a semantic token, to the spacing shim of
`@canonical/styles`, or to a literal the anatomy's ledger names:

- colour: `--color-text`, `--color-text-muted`, `--color-background`,
  `--color-border-muted`, `--color-focus-ring`;
- type: `--typography-text-secondary-font-size`, for the strip's controls
  and status and the inherited tag;
- space: `--grid-gutter`, `--container-gap-default`, `--container-gap-loose`,
  `--component-padding-block` and, where no semantic name fits, a
  `--space-*` step, which the anatomy names with its reason;
- literals: the 1px hairlines and the 2px focus ring, which no semantic
  token sizes.

Every page is a subgrid of the canvas's page grid over the whole main
column, and every grid sets its gap from `--grid-gutter` on both axes. Only
an entity's summary holds a reading measure, the first six columns of the
main column, which a narrower main column clamps. The key values stack below
two groups of columns through the one container query on the shell, at
912px.

## Public API

- Routes: `createEntityRoutes`; types `EntityRoutes`, `EntityLensOptions`.
- Layout: `EntityLayout`; types `EntityLayoutProps`.
- Pages: `EntityIndexPage`, `EntityPage`; types `EntityIndexPageProps`, `EntityPageProps`.
- Addresses, for a site's own routes that take an entity's address the way the lens's do: `expandAddress`, `readUriParam`; types `OntologyNamespace`.
