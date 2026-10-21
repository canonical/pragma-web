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

Every representation reads its node through a fragment of its own, so a
lens spreads it in its query and hands the component the key. The
representations select only what the contract guarantees on every node
(`_meta { title curie type { uri } }`); a type's own arm adds what that type
carries.

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

Mount the maps once, inside the router and beside the site's homes:

```tsx
import { HomesProvider } from "@canonical/prism-core";
import {
  defaultProjectionMaps,
  ProjectionsProvider,
} from "@canonical/prism-projections";

<HomesProvider homes={homes}>
  <ProjectionsProvider maps={defaultProjectionMaps}>
    <Outlet />
  </ProjectionsProvider>
</HomesProvider>;
```

A map is keyed by `__typename`; `Node` is the arm for every type the map
does not name. A site gives a type its own arm by spreading over the
defaults:

```tsx
const maps = {
  ...defaultProjectionMaps,
  chip: { ...defaultProjectionMaps.chip, Station: StationChip },
};
```

An arm receives the node as the representation's composite fragment reads
it, the node's home as `href` (`undefined` when it has none), and the
native props of the root it renders. A type's arm reads its own fields
through a fragment spread inside an inline fragment on that type in the
representation's composite, so every key of a map is matched by an arm of
its composite; the package's tests hold the two in step.

A node's home is resolved with its compact address (`_meta.curie`) as the
`uri` a site's home resolver receives, so one entity has one address.

## Public API

- Representations: `EntityChip`, `EntityRow`, `EntityCard`,
  `EntityCommand`, `EntityTitle`; types `EntityChipProps`, `EntityChipArm`,
  `EntityChipArmProps`, `EntityRowProps`, `EntityRowArm`,
  `EntityRowArmProps`, `EntityCardProps`, `EntityCardArm`,
  `EntityCardArmProps`, `EntityCommandProps`, `EntityCommandArm`,
  `EntityCommandArmProps`, `EntityTitleProps`, `EntityTitleArm`,
  `EntityTitleArmProps`.
- Maps: `ProjectionsProvider`, `useProjectionMaps`,
  `defaultProjectionMaps`; types `ProjectionMap`, `ProjectionMaps`,
  `ProjectionsProviderProps`.
