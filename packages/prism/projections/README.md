# @canonical/prism-projections

The Entity representations of a Prism documentation site. A lens mentions
graph nodes it knows nothing about: an ontology class's instances, the
results of a search, the entities a passage of prose links to. Each
representation renders any node, whatever its type, through the arm its
site maps to the node's `__typename`, and links it to the node's home.

- **`EntityChip`**: the inline mention, a node named in running text.
- **`EntityRow`**: the list row, a node as one entry of a list of results.
- **`EntityCard`**: the card, a node as a self-contained tile in a grid.
- **`EntityCommand`**: the command-palette entry, a node offered as a
  destination to jump to.
- **`EntityTitle`**: the page title, the heading of the page a node owns.

Prose links to graph nodes render as chips too, through the element
overrides a Markdown renderer takes.

Every representation reads its node through a fragment of its own, so a
lens spreads it in its query and hands the component the key. The
representations select only what the contract guarantees on every node
(`_meta { title curie type { uri } }`).

## Installation

```bash
bun add @canonical/prism-projections
```

Requires React 19, Relay 21 and `@canonical/prism-core`, whose
`HomesProvider` supplies each node's home.

## Building against the package

The package ships its TypeScript source and the Relay artifacts its
`build` script compiles against `@canonical/prism-contract`'s schema; it
imports those artifacts itself, so no Relay transform runs over its files.
A site still compiles the package's fragments with its own, because its
queries spread them and relay-compiler validates a spread only against a
fragment it has read.

relay-compiler reads one source tree per project and follows no symlink
into `node_modules`, so a site in this monorepo declares both trees in a
multi-project config rooted at the repository:

```json
{
  "root": "../../..",
  "sources": {
    "apps/react/my-site/src": "my-site",
    "packages/prism/projections/src": "my-site"
  },
  "excludes": ["**/node_modules/**", "**/__generated__/**"],
  "projects": {
    "my-site": {
      "schema": "apps/react/my-site/src/relay/schema.graphql",
      "language": "typescript",
      "eagerEsModules": true,
      "output": "apps/react/my-site/src/relay/__generated__",
      "schemaConfig": {
        "nodeInterfaceIdField": "uri",
        "nodeInterfaceIdVariableName": "id"
      }
    }
  }
}
```

`vite-plugin-relay-lite` cannot read a multi-project file, so the site
passes it its own source and artifact directories:

```ts
relay({
  codegen: false,
  relayConfig: {
    src: "./src",
    artifactDirectory: "./src/relay/__generated__",
    eagerEsModules: true,
  },
});
```

The plugin rewrites the site's tags only. The package's files resolve
outside the site's `src`, so they keep their own artifact imports.

## Representations

```tsx
import { EntityChip, EntityRow } from "@canonical/prism-projections";

<p>
  Built on <EntityChip node={node} />.
</p>
<ul>
  {edges.map(({ node }) => (
    <EntityRow key={node.uri} node={node} />
  ))}
</ul>
```

A representation renders no element of its own: its arm renders the root,
and every arm of one representation renders the same root tag, so the
representation's native props are that tag's:

| Representation | Root | `children` |
|---|---|---|
| `EntityChip` | `<span>` | the mention's text, in place of the node's title |
| `EntityRow` | `<li>` | none: the arm renders the slots |
| `EntityCard` | `<article>` | none |
| `EntityCommand` | `<li>` | none |
| `EntityTitle` | `<hgroup>` | none |

### Slots

An arm fills its root from a shared vocabulary of slots, each a child
element whose class names its role: `.title`, `.kind`, `.location`,
`.summary`, `.meta`, `.key-values`, `.usage` and `.preview`. A site styles
a slot once for every type of node, and an arm renders the slots its type
can fill.

The `Node` arms fill the two every node can: `.title` (`_meta.title`) and
`.location` (`_meta.curie`, the node's compact address). Each root carries
the node's class IRI as `data-type`, for styling by class. The title links
to the node's home when it has one and reads as inert text when it has
none, except in `EntityTitle`, which never links: a title names the page it
heads.

| Arm | Root class | Renders |
|---|---|---|
| chip | `.ds.node-chip` | `.title`; the root's `title` is the compact address |
| row | `.ds.node-row` | `.title`, then `<code class="location">` |
| card | `.ds.node-card` | `<h3 class="title">`, then `<p class="location">` |
| command | `.ds.node-command` | `.title`, then `<span class="location">` |
| title | `.ds.node-title` | `<h1 class="title">`, then `<p class="location">` |

## Maps and arms

Mount the maps once, inside the router and beside the site's homes, with
the site's router link adapter:

```tsx
import { HomesProvider } from "@canonical/prism-core";
import {
  defaultProjectionMaps,
  ProjectionsProvider,
} from "@canonical/prism-projections";

<HomesProvider homes={homes}>
  <ProjectionsProvider LinkComponent={RouterLink} maps={defaultProjectionMaps}>
    <Outlet />
  </ProjectionsProvider>
</HomesProvider>;
```

Every link to a node's home renders through `LinkComponent`, typed against
the shared `LinkComponentProps` of `@canonical/react-ds-global` and
defaulting to the intrinsic `"a"`. A plain anchor follows a mention with a
full document load, so a site with a client-side router passes an adapter
that renders the router's own link for an `href`; the router then navigates
on the client and the page keeps its state.

A map is keyed by `__typename`; `Node` is the arm for every type the map
does not name. An arm receives the node as its representation's composite
fragment reads it, the node's home as `href` (`undefined` when it has
none), and the native props of the root it renders.

The composites are the package's own: each spreads the fragment of every
arm the package ships, inside an inline fragment on that arm's type, and
the package's tests hold each map's keys and its composite's arms in step.
A site cannot add a spread to a composite, so an arm a site wrote for a type
of its own would see only what the composite already selects. A site
therefore mounts `defaultProjectionMaps`, whose arms are the `Node` arms.

A node's home is resolved with its compact address (`_meta.curie`) as the
`uri` a site's home resolver receives, so one entity has one address.

## Prose links

A page's prose may link to graph nodes, by absolute IRI or compact address,
in plain CommonMark: `[Button](ds:global.component.button)`. The provider
resolves the nodes a passage links to and serves them as a `NodeConnection`;
the page spreads `ProseReferencesProvider_references` on it and provides it
around the prose. `markdownComponents` is the element-override map a
Markdown renderer takes: its `a` renders a link whose href names one of the
references as that node's `EntityChip`, labelled with the author's text and
linked to the node's home, and any other link as the plain anchor its
author wrote.

```tsx
import {
  markdownComponents,
  ProseReferencesProvider,
} from "@canonical/prism-projections";

<ProseReferencesProvider references={prose.references}>
  <Markdown components={markdownComponents}>{prose.markdown}</Markdown>
</ProseReferencesProvider>;
```

With no `ProseReferencesProvider` above, every link renders as a plain
anchor. The renderer must hand a compact-address href to the override
unchanged; a renderer that strips hrefs with an unknown scheme turns every
`prefix:local` link into a link to nowhere before the override sees it.

## Public API

- Representations: `EntityChip`, `EntityRow`, `EntityCard`,
  `EntityCommand`, `EntityTitle`; types `EntityChipProps`, `EntityRowProps`,
  `EntityCardProps`, `EntityCommandProps`, `EntityTitleProps`.
- Maps: `ProjectionsProvider`, `useProjectionMaps`,
  `defaultProjectionMaps`; types `ProjectionMap`, `ProjectionMaps`,
  `ProjectionsProviderProps`.
- Prose: `markdownComponents`, `ProseReferencesProvider`; types
  `ProseLinkProps`, `ProseReferencesProviderProps`.
