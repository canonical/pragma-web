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
`HomesProvider` and `ProjectionLinkProvider`, which the inspector's instance
chips read their homes and arms from. `DefinitionsLayout` mounts the lens's
own filter provider, shared by the facet bar's chips and the explorer.

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
`Node` arm does not. A site mounts `ProjectionLinkProvider`: the `Node` arms
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
mode strip (the breadcrumb trail and the status figure), the facet bar
under it (the filter chips), the explorer in the canvas and the term
inspector in the inspector region, a drawer below three groups of columns.
Below two groups the bar folds into the strip's "Filter · n" link, which
opens the filter sheet through the address (`?sheet=filter`). The router mounts the layout
again on each of the lens's routes, so the lens keeps the reader's chips
and search for the router's life while the reader stays in the lens, and
the zoom and pan while the graph keeps its drawing: a pick in the rail of
a class the graph already draws pans the graph to the selection and
changes nothing else; a move that opens or closes a namespace (see
below) opens the graph as loading its address does; and a visit to
another lens and back starts afresh.

- **The term rail** lists each ontology's classes in the graph's own order,
  a parent before its children, each with its depth and its kind's mark,
  then its properties; a search field over every term heads it. The rail
  dims what the filter leaves out and never hides it.
- **The class graph** is laid out on the server, deterministically, in
  layered columns per namespace on a 16px lattice: subclass buses with one
  hollow head at each superclass, relations bundled per pair with a filled
  head at each range, self-relations as one loop, hubs taller. It is drawn
  as native SVG, each class an `EntityGraphNode`, inside prism-core's
  `GraphCanvas`, which pans and zooms with `d3-zoom` on the client. The
  canvas opens on the whole graph when it fits there at a zoom where every
  label renders at 12px or more, else on a legible window of it, around the
  class a term page selects, whose left, top and right edges cut through no
  box, with no box cut on two sides in its corner; once the client has
  measured the canvas it opens on the window that size calls for, and
  again when a resize shrinks a view nothing has moved below the legible
  zoom. A filter's refit or a picked namespace never zooms a legible view
  out to an illegible one: what is too large shows from its corner in a
  window that cuts no box. Fit fits the whole, and the camera pans over all
  of it. Text below 12px on screen is not drawn. Pointing
  at or focusing a class fades everything outside its neighbourhood and
  labels its relations; the selection is ringed and its lineage drawn; the
  arrows move along the tree. Below one group of columns the graph becomes
  rows in rail order for a phone.
- **The term inspector** shows the selected term in sections (lineage,
  definition, subclasses, fields, relations, instances for a class; kind,
  range, domain and inverse for a property), every reference a term link,
  on the inspector region's three columns: a key or a field's name on the
  first, its value on the rest, row after row.
  With no term it explains the graph with a legend drawn by the graph's own
  code, a row per namespace that fits the camera to it, and the gestures.

## The overview

The class graph is an overview of every namespace the graph serves, drawn
within prism-core's graph budget (`GRAPH_BUDGET`) and laid out on the
server, deterministically: two renders of a page give the same SVG.

- **Namespaces, packed by their bridges.** Each namespace is a region of
  layered columns; the regions are packed on shelves, those that share
  the most bridges side by side. A bridge is a relation from a class of
  one namespace to a class of another, or to a class no loaded ontology
  holds. Bridges are drawn in the strong line and named at rest by their
  property, near their head; bridges between the same two namespaces each
  keep a lane of their own, and a label with no room of its own is named
  when either end is in focus.
- **Weights.** A relation's line states how many statements the graph
  holds for it (`Query.classEdges`): 1px below 10, 2px from 10, 4px from
  100 and 8px from 1000; a relation with no statements yet is dashed. A
  line that bundles several relations between two classes weighs the
  heaviest of them.
- **Stubs.** A class the relations reach that no loaded ontology holds is
  a dashed stub, named by its well-known prefix (`rdf:List`), else by its
  host and last segment, never two alike.
- **The budget.** The overview draws at most `drawnNodesMax` (40) nodes,
  `bandMembersMax` (12) in any column, and an SVG of at most `svgBytesMax`
  (64 KiB) and `svgElementsMax` (500) elements. Past the node budget, and
  for as long as its opening on the design canvas (the canvas at 1440 by
  900) does not hold every namespace, the largest namespace still drawn
  class by class is drawn as one box instead, and so on. A box says how
  many classes and relations it holds, leads the first shelf, and carries
  the relations with one end inside it; the rail still lists every class.
  A layer of more than twelve classes is laid as balanced consecutive
  columns.
- **An opened view.** A box links to its namespace opened, at the
  address `/definitions?expand=<prefix>` (`/definitions?expand=surface`):
  the namespace drawn class by class and packed first, the others as
  boxes. Its heading is the way back to the overview at rest, keeping the
  address's other view keys. A term page of a class inside a box opens
  that namespace too. Every view opens by one rule: the whole map where it
  fits the canvas with every label at 12px or more on screen (a zoom of
  12/14), otherwise the map's top-left corner at that zoom; a term page
  frames its class instead.
- **The stated limits.** Three lanes between two namespaces: a fourth
  bridge between them runs closer than 4px to its neighbour, and from six
  they lie on one line. A namespace with more classes than the budget
  leaves room for is drawn whole, over the budget, when it is opened.
  More namespaces than the budget has nodes are all drawn as boxes, over
  the budget. Neither site's data reaches these limits.

Not in this package yet: the term page's neighbourhood across namespaces
(the classes of other namespaces a class relates to, drawn around it);
the counts as links to the rows they count; the inspector's count line
with nothing selected; and the list of the relations the graph observes
that no ontology declares.

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
- motion: `--motion-duration-fast`, the graph's fade, which reduced motion
  zeroes;
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
component, each over a captured store; the class graph's and the phone
view's stories show the overview's states (weighted strokes, bridges in
lanes, boxes and stubs, an opened namespace, a split band). The graph
checks the sites' Definitions browser tests share, which read the
canvas's served SVG and what a site's graph serves, are exported for the
repository's own tests from `@canonical/prism-lens-definitions/testing/browser`.

## Public API

- Routes: `definitionsRoutes`, `warmDefinitions`.
- Layout: `DefinitionsLayout`; types `DefinitionsLayoutProps`.
