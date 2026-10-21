# @canonical/prism-lens-definitions

The Definitions lens of a Prism documentation site: an ontology explorer over
the graph's classes and properties. A term rail lists every term the
ontologies carry, a class hierarchy well draws each ontology's classes and the
relations between them, and a term inspector shows the selected class or
property in full, with the instances of a class mentioned as entity chips.

The lens is **Tier 1**: its one operation and its fragments compile against
`@canonical/prism-contract`'s SDL alone, so it runs over any provider that
conforms to the contract.

## Installation

```bash
bun add @canonical/prism-lens-definitions
```

Requires React 19, Relay 21, `@canonical/prism-core`,
`@canonical/prism-projections` and `@canonical/react-head`.

## Mounting the lens

A site groups the lens's two routes under a router wrapper of
`DefinitionsLayout`, binding its own rail and colophon to the layout once:

```tsx
import {
  DefinitionsLayout,
  definitionsRoutes,
} from "@canonical/prism-lens-definitions";
import { group, wrapper, type WrapperComponentProps } from "@canonical/router-core";
import type { ReactElement, ReactNode } from "react";

const SiteDefinitionsLayout = ({ children }: WrapperComponentProps<ReactNode>) => (
  <DefinitionsLayout colophon={<SiteColophon />} rail={<SiteRail />}>
    {children}
  </DefinitionsLayout>
);

const definitionsLayout = wrapper<ReactElement>({
  id: "definitions-layout",
  component: SiteDefinitionsLayout,
});

const [definitions, definitionsTerm] = group(definitionsLayout, [
  definitionsRoutes.definitions,
  definitionsRoutes.definitionsTerm,
] as const);
```

The lens renders inside the site's provider nest: `HeadProvider`,
`RelayEnvironmentProvider`, `RouterProvider`, and inside the router
`HomesProvider` and `ProjectionsProvider`, which the inspector's instance
chips read their homes and arms from. `DefinitionsLayout` mounts the lens's
own filter provider, shared by the strip's chips and the explorer.

On the server, a site prepares the store through each route's `warm`
(`warmDefinitions`), which prefetches the lens's one operation into the
published prefetch environment; the page then renders from the warm store and
hydrates without a second request.

## Route names your register must carry

The lens links by route name, so a site's route table keeps both routes under
these keys:

- `definitions`: `/definitions`, the lens index the rail, the breadcrumb and
  the lens shortcut link to.
- `definitionsTerm`: `/definitions/:term`, the term as a percent-encoded
  compact address (`/definitions/ds%3AUIBlock`), which every term link in the
  lens renders with `Link to="definitionsTerm"`.

The lens's links are typed by the site's `RouterRegister`, so a table that
renames either key fails the site's type check. To link ontology classes
and properties mentioned elsewhere on the site to their term view, declare
their homes:

```ts
const homes: Homes = {
  OntologyClass: (node, router) =>
    router.buildPath("definitionsTerm", { params: { term: node.uri } }),
  OntologyProperty: (node, router) =>
    router.buildPath("definitionsTerm", { params: { term: node.uri } }),
};
```

## Mentions of classes and properties

The lens ships no projection arms. An arm reads only what its
representation's composite fragment selects, and only
`@canonical/prism-projections` writes the composites, so an
`OntologyClass` or `OntologyProperty` arm here could render nothing the
`Node` arm does not. A site mounts `defaultProjectionMaps`: its `Node` arms
render a mentioned class or property by its title and compact address, and
the homes above link the mention to the term view.

## Rail placement

The explorer route declares the lens with `order: 3`, `tier: 1` and the
shortcut `"3"`. A site's other lenses must claim other orders and other
digits: `collectLenses` throws on a duplicate order, and `collectShortcuts`
on a duplicate key.

## Building against the package

The package ships its TypeScript source and the Relay artifacts its `build`
script compiles against `@canonical/prism-contract`'s SDL into
`src/__generated__`. It imports those artifacts itself, so no Relay transform
runs over its files, and a site compiles nothing of the lens unless its own
documents spread a lens fragment.

The package's `relay.config.json` reads the projections package's fragments
as a base project, because the inspector spreads `EntityChip_node`; only the
lens's own artifacts land in `src/__generated__`. `check:tier1` runs
`relay-compiler --validate` against the contract SDL alone: it fails when a
selection leaves the contract and when the artifacts are stale. Run
`bun run relay` after editing a fragment.

## Styling

The stylesheets sit in the `ds.prism` cascade layer. Each design decision
reads a component token, declared on `:root` and named for its component
(`--term-rail-dimmed-opacity`, `--hierarchy-well-accent-color`, …), so a
site retunes the lens by setting component tokens. Where the design system
has a semantic token for the decision, the component token reads it, so a
site also retunes those decisions through its theme:

- colour: `--color-text`, `--color-text-muted`, `--color-text-branded`,
  `--color-background`, `--color-background-contrasted`, `--color-border`,
  `--color-border-muted`;
- space and motion: `--space-025` to `--space-800`, `--motion-duration-fast`,
  each with the lens's own default as its fallback.

The design system has no semantic token for the rest, so the component
token holds the lens's own value and only the component token retunes it:
every type size, font family, weight, tracking and line height; every
radius, border, stroke and edge width; the focus ring's width and offset;
every opacity and shadow geometry; the indicator size and the legend's
arrowhead; and two layout measures,
`--definitions-explorer-well-min-block-size` and
`--well-legend-max-inline-size`. No component token reads a primitive
token.

The stylesheets also read custom properties that are not design decisions:

- `--grid-intrinsic`, the intrinsic column template from `@canonical/styles`,
  which the layout's root reads;
- `--z-plate` and `--z-underground`, the strata the well's floating hint and
  legend are raised to and the well itself sits on, and
  `--surface-underground-background`, the well floor's tint, which the site
  defines.

## Public API

- Routes: `definitionsRoutes`, `warmDefinitions`.
- Layout: `DefinitionsLayout`; types `DefinitionsLayoutProps`.
