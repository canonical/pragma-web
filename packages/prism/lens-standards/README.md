# @canonical/prism-lens-standards

The Standards lens of a Prism documentation site: a grouped index of the
instances of the class a site binds it to, and a reading page for each. The
index groups the standards by their own class, with jump links between the
groups and an explicit "Load more" when the graph carries more than one page.
The reading page shows a standard's title, compact address, class and
description, and refuses an address whose node is not one of the bound
class's instances.

The lens is **Tier 1**: its operations and its fragments compile against
`@canonical/prism-contract`'s SDL alone, so it runs over any provider that
conforms to the contract.

## Installation

```bash
bun add @canonical/prism-lens-standards
```

Requires React 19, Relay 21, `@canonical/prism-core`,
`@canonical/prism-projections` and `@canonical/react-head`.

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

The lens renders inside the site's provider nest: `HeadProvider`,
`RelayEnvironmentProvider` and `RouterProvider`.

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
mentioned elsewhere on the site to their reading page, declare their home
under the type the provider serves them as:

```ts
const homes: Homes = {
  CodeStandard: (node, router) =>
    router.buildPath("standardEntity", { params: { uri: node.uri } }),
};
```

## Rail placement

The index route declares the lens with `order: 4`, `tier: 1` and the
shortcut `"4"`. A site's other lenses must claim other orders and other
digits: `collectLenses` throws on a duplicate order, and `collectShortcuts`
on a duplicate key.

## Building against the package

The package ships its TypeScript source and the Relay artifacts its `build`
script compiles into `src/__generated__`. It imports those artifacts itself,
so no Relay transform runs over its files, and a site compiles nothing of the
lens unless its own documents spread a lens fragment.

The package's `relay.config.json` reads the projections package's fragments
as a base project; only the lens's own artifacts land in `src/__generated__`.
`check:tier1` runs `relay-compiler --validate` against the contract SDL
alone: it fails when a selection leaves the contract and when the artifacts
are stale. Run `bun run relay` after editing a fragment.

## Styling

The stylesheets sit in the `ds.prism` cascade layer. Each design decision
reads a component token, declared on `:root` and named for its component
(`--standards-index-link-color`, `--standard-article-meta-gap`, …), so a
site retunes the lens by setting component tokens. Where the design system
has a semantic token for the decision, the component token reads it, so a
site also retunes those decisions through its theme:

- colour: `--color-text`, `--color-text-muted`, `--color-background`;
- space: `--space-100` to `--space-300`, each with the lens's own default
  as its fallback.

The design system has no semantic token for a reading measure, so
`--standard-article-max-inline-size` holds the lens's own value and only the
component token retunes it. No component token reads a primitive token.

The layout's root also reads `--grid-intrinsic`, the intrinsic column
template from `@canonical/styles`, which is not a design decision.

## Public API

- Routes: `createStandardsRoutes`; types `StandardsBinding`.
- Layout: `StandardsLayout`; types `StandardsLayoutProps`.
