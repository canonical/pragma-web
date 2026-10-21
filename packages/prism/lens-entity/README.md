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

The layout's root also reads `--grid-intrinsic`, the intrinsic column
template from `@canonical/styles`; every other grid is a subgrid of it.
