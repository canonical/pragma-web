# @canonical/prism-lens-definitions

The Definitions lens of a Prism documentation site: an ontology explorer over
the graph's classes and properties, on the workspace archetype. A term rail
lists every term the ontologies carry, an SVG class graph draws each
ontology's classes and the relations between them on a canvas that pans and
zooms, and a term inspector shows the selected class or property in full,
with the instances of a class mentioned as entity chips.

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
`DefinitionsLayout`, binding its own rail to the layout once:

```tsx
import {
  DefinitionsLayout,
  definitionsRoutes,
} from "@canonical/prism-lens-definitions";
import { group, wrapper, type WrapperComponentProps } from "@canonical/router-core";
import type { ReactElement, ReactNode } from "react";

const SiteDefinitionsLayout = ({ children }: WrapperComponentProps<ReactNode>) => (
  <DefinitionsLayout rail={<SiteRail />}>
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
as a base project, because the inspector spreads `ChipProjection_node`; only the
lens's own artifacts land in `src/__generated__`. `check:tier1` runs
`relay-compiler --validate` against the contract SDL alone: it fails when a
selection leaves the contract and when the artifacts are stale. Run
`bun run relay` after editing a fragment.

## The workspace

`DefinitionsLayout` lays the lens on `WorkspaceLayout`: the site's rail, the
mode strip (the breadcrumb trail, the filter chips and the status figure),
the explorer in the canvas and the term inspector in the inspector region,
a drawer below three groups of columns.

- **The term rail** lists each ontology's classes in the graph's own order,
  a parent before its children, each with its depth and its kind's mark,
  then its properties; a search field over every term heads it. The rail
  dims what the filter leaves out and never hides it.
- **The class graph** is laid out on the server, deterministically, in
  layered columns per namespace on a 16px lattice: subclass buses with one
  hollow head at each superclass, relations bundled per pair with a filled
  head at each range, self-relations as one loop, hubs taller. It is drawn
  as native SVG, each class an `EntityGraphNode`, inside prism-core's
  `GraphCanvas`, which fits the graph on first paint and pans and zooms with
  `d3-zoom` on the client. Text below 12px on screen is not drawn. Pointing
  at or focusing a class fades everything outside its neighbourhood and
  labels its relations; the selection is ringed and its lineage drawn; the
  arrows move along the tree. Below one group of columns the graph becomes
  rows in rail order for a phone.
- **The term inspector** shows the selected term in sections (lineage,
  definition, subclasses, fields, relations, instances for a class; kind,
  range, domain and inverse for a property), every reference a term link.
  With no term it explains the graph with a legend drawn by the graph's own
  code, a row per namespace that fits the camera to it, and the gestures.

## Styling

Every component is scaffolded by the React component generator under
`src/lib/ui/`, with an `anatomy.yaml` its stylesheet transcribes, and its
stylesheet sits in the `ds.components.global` cascade layer. Each design
decision reads a component token declared on the component's root rule and
named for it (`--term-rail-dimmed-opacity`, `--class-graph-edge-color`, …),
so a site retunes the lens by setting component tokens. A component token
reads the design system's semantic tier or the spacing shim where they hold
the decision, so a site also retunes those through its theme:

- colour: `--color-text`, `--color-text-muted`, `--color-text-branded`,
  `--color-background`, `--color-background-container`,
  `--color-background-layer2`, `--color-border`, `--color-border-muted`,
  `--color-focus-ring`;
- type: the semantic `--typography-text-*` sizes, weights and code family;
- space: `--component-padding-*`, `--container-gap-*`, `--grid-gutter` and
  the `--space-*` steps.

Where the tiers hold no token for a decision, the component token holds the
lens's own value, and each component's anatomy names it in its ledger: the
graph's floor and relation edge colours, the 16px type of a term's name and
a region's prefix, the fade and dim opacities, the hairlines and focus
rings, and the pills' radius. The lens reads no primitive token, and
reshapes only through the shell's container queries at whole groups of
columns.

The package has a Storybook (`bun run storybook`) with a story for every
component, each over a captured store.

## Public API

- Routes: `definitionsRoutes`, `warmDefinitions`.
- Layout: `DefinitionsLayout`; types `DefinitionsLayoutProps`.
