# @canonical/prism-lens-entity

The class-bound docs view of a Prism documentation site. For each class a
site binds, the lens gives two pages: an index of the class's instances, as
rows or cards, with a search over the loaded entries, and a page per
instance with its title, its definition and comment, its class, the fields
its class declares and the relations among them.

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
controls and the index.

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

- The entity's title and compact address, through the site's title
  projection.
- Its definition and its comment, each when the graph asserts one.
- The class it is an instance of, mentioned through the site's chip
  projection.
- The fields its class declares, own and inherited: each field's name, the
  property it answers to and the range of its values in compact form, the
  property's kind and the field's cardinality.
- Its relations: each field of object kind, with the class its values belong
  to and its cardinality.

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
as a base project, because the index spreads `EntityRow_node` and
`EntityCard_node` and the page `EntityTitle_node` and `EntityChip_node`; only
the lens's own artifacts land in `src/__generated__`. `check:tier1` runs
`relay-compiler --validate` against the contract SDL alone: it fails when a
selection leaves the contract and when the artifacts are stale. Run
`bun run relay` after editing a fragment.

## Styling

The stylesheets sit in the `ds.prism` cascade layer. Each design decision
reads a component token, declared on `:root` and named for its component
(`--entity-index-gap`, `--fields-table-border-color`, …), so a site retunes
the lens by setting component tokens. Where the design system has a semantic
token for the decision, the component token reads it, so a site also retunes
those decisions through its theme:

- colour: `--color-text`, `--color-text-muted`, `--color-background`,
  `--color-background-contrasted`, `--color-border-muted`;
- space: `--space-025` to `--space-300`, each with the lens's own default as
  its fallback.

The design system has no semantic token for the rest, so the component token
holds the lens's own value and only the component token retunes it: the type
sizes of the strip's controls and status and of the inherited tag, the border
widths, the controls' radius and focus ring, and how many columns a card
spans (`--entity-index-card-span`). No component token reads a primitive
token.

`EntityLayout` is the core's `DocumentLayout`: every grid in the lens is a
subgrid of the site's one intrinsic grid, and only the canvas scrolls.

## Public API

- Routes: `createEntityRoutes`; types `EntityRoutes`, `EntityLensOptions`.
- Layout: `EntityLayout`; types `EntityLayoutProps`.
- Pages: `EntityIndexPage`, `EntityPage`; types `EntityIndexPageProps`, `EntityPageProps`.
- Addresses, for a site's own routes that take an entity's address the way the lens's do: `expandAddress`, `readUriParam`; types `OntologyNamespace`.
