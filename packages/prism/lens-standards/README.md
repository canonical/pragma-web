# @canonical/prism-lens-standards

The Standards lens of a Prism documentation site: a grouped index of the
instances of the class a site binds it to, and a reading page for each. The
index groups the standards by their own class, with jump links between the
groups, each group's entries in the shared list view of
`@canonical/prism-projections`, and an explicit "Load more" when the graph
carries more than one page.
The reading page shows a standard's title, compact address and class, then
its prose rendered as Markdown, and refuses an address whose node is not one
of the bound class's instances. A standard with no prose shows its
description instead.

The lens is **Tier 2**: its operations compile against
`@canonical/prism-contract`'s SDL plus the Prose extension
(`schema/prose.graphql`), `Query.prose(uri:)` and its `Prose` type. It runs
over any provider that conforms to the contract and serves that extension;
both providers in this repository, `@canonical/prism-pragma-provider` and
`@canonical/prism-graph-example`, do.

## Installation

```bash
bun add @canonical/prism-lens-standards
```

Requires React 19, Relay 21, `@canonical/prism-core`,
`@canonical/prism-projections`, `@canonical/react-head` and
`@canonical/react-markdown`.

## Binding the lens

The lens shows the instances of one ontology class, which the site names when
it creates the lens's routes:

```ts
import { createStandardsRoutes } from "@canonical/prism-lens-standards";

export const STANDARDS_BINDING = { classUri: "cs:CodeStandard" } as const;

export const standardsRoutes = createStandardsRoutes(STANDARDS_BINDING);
```

`classUri` is the class as `ontologyClass(uri:)` accepts it: a prefixed
address or an absolute IRI. Keep the binding a module constant, never an
environment variable: it becomes a GraphQL variable, and the server's prepare
step and the browser's hydration must compute byte-identical variables for
the warm store to fulfil the page's operation. A variable that resolves
differently in the client build and in the server renderer breaks that.
`createStandardsRoutes` throws when `classUri` is empty. Any
`EntityBinding` from `@canonical/prism-core` is a binding too.

## Mounting the lens

A site groups the lens's two routes under a router wrapper of
`StandardsLayout`, binding its own rail and colophon to the layout once:

```tsx
import { StandardsLayout } from "@canonical/prism-lens-standards";
import { group, wrapper, type WrapperComponentProps } from "@canonical/router-core";
import type { ReactElement, ReactNode } from "react";

const SiteStandardsLayout = ({ children }: WrapperComponentProps<ReactNode>) => (
  <StandardsLayout colophon={<SiteColophon />} rail={<SiteRail />}>
    {children}
  </StandardsLayout>
);

const standardsLayout = wrapper<ReactElement>({
  id: "standards-layout",
  component: SiteStandardsLayout,
});

const [standards, standardEntity] = group(standardsLayout, [
  standardsRoutes.standards,
  standardsRoutes.standardEntity,
] as const);
```

The layout is core's `DocumentLayout`, the document archetype: the site's
rail, the mode strip carrying the lens's breadcrumb trail, the routed page in
the canvas, the one region that scrolls, and the colophon in the band under
it. The layout renders no element of its own; its native props reach the
document layout's root.

The lens renders inside the site's provider nest: `HeadProvider`,
`RelayEnvironmentProvider`, `RouterProvider`, and inside the router
`HomesProvider` and `ProjectionsProvider`, which the prose's chips read their
homes and arms from. The prose takes its space from the typography layer of
`@canonical/styles`: it carries `.editorial` and `.content-flow`, so a site
that mounts the lens loads that layer, or its prose has no paragraph
spacing.

## Links in a standard's prose

A link in a standard's prose whose destination is one of the entities the
provider resolved as the prose's references, written as its compact address
(`[props](cs:react.component.props)`) or its absolute IRI, renders as that
entity's chip: the author's text, linked to the entity's home. Every other
link stays the link its author wrote, and a link inside a code span stays
text. The prose's headings render one level down, so the standard's title
stays the page's only `h1`, and the prose's root carries the language the
provider served it in as `lang`.

On the server, a site prepares the store through each route's `warm`, which
prefetches the route's operation into the published prefetch environment; the
page then renders from the warm store and hydrates without a second request.

## Route names your register must carry

The lens links by route name, so a site's route table keeps both routes under
these keys:

- `standards`: `/standards`, the lens index the rail, the breadcrumb and the
  lens shortcut link to.
- `standardEntity`: `/standards/:uri`, one standard, addressed by its
  percent-encoded absolute IRI
  (`/standards/http%3A%2F%2Fpragma.canonical.com%2Fcodestandards%23code.array.safe_access`),
  which every index link renders with `Link to="standardEntity"`. The address
  is absolute because `node(id:)` accepts nothing else.

The lens's links are typed by the site's `RouterRegister`, so a table that
renames either key fails the site's type check. To link the standards
mentioned on the site, in a standard's prose among other places, to their
reading page, declare their home under the type the provider serves them
as. A mention hands its home the node's compact address, and the reading
page is addressed by the absolute IRI, so the home expands the prefix:

```ts
const CODE_STANDARDS_NAMESPACE = "http://pragma.canonical.com/codestandards#";

const homes: Homes = {
  CodeStandard: (node, router) =>
    router.buildPath("standardEntity", {
      params: { uri: node.uri.replace(/^cs:/, CODE_STANDARDS_NAMESPACE) },
    }),
};
```

## Rail placement

The index route declares the lens with `order: 4`, `tier: 2` and the
shortcut `"4"`. A site's other lenses must claim other orders and other
digits: `collectLenses` throws on a duplicate order, and `collectShortcuts`
on a duplicate key.

## Building against the package

The package ships its TypeScript source and the Relay artifacts its `build`
script compiles into `src/__generated__`. It imports those artifacts itself,
so no Relay transform runs over its files, and a site compiles nothing of the
lens unless its own documents spread a lens fragment.

The package's `relay.config.json` reads the projections package's fragments
as a base project, compiled against the contract SDL; only the lens's own
artifacts land in `src/__generated__`. The lens's own project compiles
against `.relay/schema.graphql`, which `bun run schema` writes: the contract
SDL with the Prose extension merged into its `Query` type. It is merged, not
handed to relay-compiler as an extension, because relay-compiler compiles a
field it reads from `extend type Query` as a client extension and never
sends it to the server.

`check:tier2` writes that schema and runs `relay-compiler --validate`
against it: it fails when a selection leaves the contract and the Prose
extension, and when the artifacts are stale. Run `bun run relay` after
editing a fragment.

## Styling

Every component sits in `src/lib/ui/`, scaffolded by the component
generator, and carries an `anatomy.yaml`: its slots and every style
decision, bound to a token. Its `styles.css` transcribes the anatomy, in the
`ds.components.global` cascade layer, and the package's tests check that it
does (`@canonical/prism-core/testing`).

Each design decision reads a component token declared on its component's
root class (`.ds.standard-article { --standard-article-header-gap: … }`),
never on `:root`, bound to a semantic token or to the spacing shim of
`@canonical/styles`:

- colour: `--color-text-muted`;
- space: `--grid-gutter`, `--container-gap-default`, `--container-gap-loose`
  and, where no semantic name fits, a `--space-*` step, which the anatomy
  names with its reason.

Every page is a subgrid of the canvas's page grid over the whole main
column, and every grid sets its gap from `--grid-gutter` on both axes. Only
a standard's prose holds a reading measure, the first six columns of the
main column, which a narrower main column clamps. A larger separation, above
a group of the index, is external spacing on the group.

The anatomies list what no token binds yet, the roster namespaces the shim's
symbols fall outside of, in their ledgers.

## Public API

- Routes: `createStandardsRoutes`; types `StandardsBinding`.
- Layout: `StandardsLayout`; types `StandardsLayoutProps`.
