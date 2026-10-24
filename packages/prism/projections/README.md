# @canonical/prism-projections

The Entity projections of a Prism documentation site, in two layers.
The representations (`EntityChip`, `EntityRow`, `EntityCard`,
`EntityCommand`, `EntityGraphNode` and the `EntityList` that lists them)
are slotted components that read no Relay fragment: a lens or a story
fills their slots with whatever it has. The projections fill them from the
graph: each is one type in one form, reads its own fragment, and renders
the representation of its form with the slots its type has, linked to the
entity's home.

- **Node projections** (`NodeChip`, `NodeRow`, `NodeCard`, `NodeCommand`,
  `NodeGraphNode`): any graph node, from what every node carries.
- **Class projections** (`OntologyClassChip`, …, `OntologyClassGraphNode`):
  an ontology class, as the projection matrix's classes row draws it.
- **Property projections** (`OntologyPropertyChip`, …,
  `OntologyPropertyGraphNode`): an ontology property, which is not a node,
  so a lens spreads its projection where it selects the property.

A lens that mentions nodes it knows nothing about (an ontology class's
instances, the results of a search, the entities a passage of prose links
to) renders them through a **dispatcher**, one per form: `ChipProjection`,
`RowProjection`, `CardProjection`, `CommandProjection` and
`GraphNodeProjection` render a node through the arm its site maps to the
node's `__typename`. `NodeList` lists any nodes through the card and row
dispatchers, as the shared list view. Prose links to graph nodes render as
chips too, through the element overrides a Markdown renderer takes.

## Slotted representations

A representation reads no Relay fragment and no context: it renders the
slots it is given, in the order its anatomy fixes, and links its title to
`href` through `LinkComponent` (the intrinsic `"a"` by default) or renders
it as inert text without one. Each folder under `src/lib/ui/` carries its
`anatomy.yaml`, the design contract its stylesheet transcribes. The chip,
the row, the command and the card set the context's primary text on the
matrix's 24px line, as the graph node draws its two lines, so each keeps
its height in every context: the chip 28px, the row 32px, the command
56px. The package's Storybook
lays the five representations of each type out as one matrix, under
`Documentation/Projection matrix`.

- **`EntityChip`**: the inline mention, a pill in running text: an
  optional lead filed before the catalog's separator, the value, then an
  optional badge, icon and disclosure chevron.
- **`EntityRow`**: the list entry, one row of an index: the namespace
  prefix and the title, then one muted word at the end. Where the two do
  not share a line, as on a phone, the word moves to a line of its own
  under the title (56px) and a long title wraps, so it is never cut.
- **`EntityCard`**: the card, built on the published `Card`: location, the
  title and the entity it belongs to (after `∈`, or after `⊂` with
  `parentRelation="subclass"`), kind, summary, key values and the
  footer's vitals, and an optional sidecar beside them, two columns wide,
  for a rendered example of the entity.
- **`EntityCommand`**: the command-palette result, a two-line row: the title
  over "kind in location", and one vital at the end.
- **`EntityGraphNode`**: the graph node, native SVG: a `<g>` of a box with
  rounded corners and its `<text>`, the title over "kind in location" (50
  units tall by default), or the title alone on the middle of a box the
  graph sizes, an optional vital (an instance count) at the end of the
  title's line, and the graph's encodings: `hollow` (an abstract class),
  `prominent` (a hub) and `showText` (off when zoomed out), for a graph to
  place with a transform inside its `<svg>`.
- **`EntityList`**: the shared list view of an index: a toolbar with the
  count line and the cards and rows toggle, then its children as cards in
  the published `Cards` group (two columns each) or as rows in an ordered
  list, or one line when it has none. It keeps no view of its own: its
  consumer passes `view` and takes the reader's pick from `onViewChange`.

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

Each projection's tests, SSR test and stories colocate the operations they
render it under. A site's compiler need not read them, so its config
excludes the package's test and story files:

```json
"excludes": [
  "**/node_modules/**",
  "**/__generated__/**",
  "packages/prism/*/src/**/*.test.tsx",
  "packages/prism/*/src/**/*.stories.tsx"
]
```

## Projections

A projection reads its own fragment, `<Name>_node`, so a lens spreads it in
its query and hands the component the key. It renders the representation
of its form, whose native props it takes (the chip's `<span>`, the row's
and the command's `<li>`, the card's `<div>`, the graph node's SVG `<g>`),
and merges its own class after the representation's:
`ds entity-card ds ontology-class-card`. Its root carries the typename as
`data-type`. It computes its own home, so a lens may render one directly:

```tsx
import { OntologyClassCard } from "@canonical/prism-projections";

<OntologyClassCard node={data.ontologyClass} />;
```

### Slots

Each projection fills the slots its type has, in the representation's
order, and leaves the others empty. A node's prefix is the compact
address's (`ds` in `ds:Layout`); an address the provider could not compact
has none.

| Projection | Slots |
|---|---|
| `NodeChip` | the title, or the passage's own text |
| `NodeRow` | `ds:` muted, the title, the node's class at the end |
| `NodeCard` | the prefix, the title, the class, the definition |
| `NodeCommand` | the title over "class in prefix" |
| `NodeGraphNode` | the compact address over "class in prefix" |
| `OntologyClassChip` | the title, or the passage's own text |
| `OntologyClassRow` | `ds:` muted, the title, "abstract" for an abstract class |
| `OntologyClassCard` | "title ⊂ superclass", "Abstract class in ds", the definition |
| `OntologyClassCommand` | the title over "Abstract class in ds", "used in 88 instances" |
| `OntologyClassGraphNode` | the compact address over "Abstract class in ds" |
| `OntologyPropertyChip` | the name, or the passage's own text |
| `OntologyPropertyRow` | the name, its kind's word (object, datatype, annotation) |
| `OntologyPropertyCard` | the name, "kind in domain", the definition, the range and the inverse, "functional" |
| `OntologyPropertyCommand` | the name over "kind in domain", the range at the end |
| `OntologyPropertyGraphNode` | the name over "kind in domain" |

A property's name is its label, or the local name of its IRI when it has
none. Every word a reader sees comes from the package's catalog.

Each projection's folder carries a projected `anatomy.yaml`: its root
projects `on` its type, and each slot names the field it reads. The
anatomies suite holds each anatomy's field paths to the compiled
fragment's.

## Dispatchers and maps

```tsx
import { ChipProjection, RowProjection } from "@canonical/prism-projections";

<p>
  Built on <ChipProjection node={node} />.
</p>
<ul>
  {edges.map(({ node }) => (
    <RowProjection key={node.uri} node={node} />
  ))}
</ul>
```

A dispatcher renders no element of its own: its arm renders the root, and
every arm of one form renders the same representation, so the
dispatcher's native props are that root's. The chip takes `children`, the
mention's text in place of the name.

A dispatcher reads a composite fragment: the node's typename, each arm's
fragment spread aliased by the type it projects,
`...NodeCard_node @alias(as: "Node")` and
`...OntologyClassCard_node @alias(as: "OntologyClass")`, and the site slot,
`...SiteCardSlot_node @alias(as: "Site")`. Each form's map holds the
arms:

- `Node`: the arm of every type no other arm takes.
- `types`: one arm per aliased spread besides `Node`, each typed against
  that alias's key, so a wrong or missing arm does not compile.
- `siteTypes`: a site's arms for its own types, by typename. Each reads
  the site slot's key and receives the node's typename beside it
  (`SiteArmProps`); see "Site arms" below.

A typed arm wins, then a site arm, then the `Node` arm. The package's
tests hold each composite's aliases, its map's `types` and its
dispatcher's anatomy cases to one set.

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

A site with types of its own extends the defaults, as "Site arms" below
describes.

Every link to a home renders through `LinkComponent`, typed against the
shared `LinkComponentProps` of `@canonical/react-ds-global` and defaulting
to the intrinsic `"a"`. A plain anchor follows a mention with a full
document load, so a site with a client-side router passes an adapter that
renders the router's own link for an `href`; the router then navigates on
the client and the page keeps its state. A site's own projections read the
same link with `useProjectionLink`, so their homes navigate as the
package's arms do.

A node's or a class's home is resolved with its compact address
(`_meta.curie`) as the `uri` a site's home resolver receives, so one
entity has one address; a property's with its IRI, its only address.

### A site's own composites

A site arm reads the `Node` key alone, so it can show only what every node
carries. A site whose types need their own fields writes a composite of its
own on `Node` and a dispatcher over it: the composite spreads the package's
dispatcher of that form aliased as `Node`, and each of the site's
projections aliased by the type it is on, narrowing an interface's
projection to each type with an aliased inline fragment
(`... on Component @alias(as: "Component") { ...UIBlockCard_node }`). Its
map's `Node` arm is the package's dispatcher, so every other node, ontology
classes included, still dispatches through the maps the site provides, and
`renderArm` keeps one precedence and one compile-time check for both:

```tsx
import { renderArm } from "@canonical/prism-projections";

export default function SiteCardProjection({ node, ...props }) {
  const data = useFragment(nodeFragment, node);
  return renderArm(siteProjectionMaps.card, data, props);
}
```

A site's own projections read their link through `useProjectionLink` and
their namespace prefix through `findCuriePrefix`, as the package's do.

## Site arms

A site projects its own types, a metro site's stations or a docsite's
components, through the site slot every composite spreads:
`...Site<Form>Slot_node @alias(as: "Site")`, a fragment on `Node`.
The package ships a default of each, in `src/lib/site/`, that reads the
typename alone, for a site with no types of its own; the package, the lens
packages and any site that compiles the package's documents compile it.
The slot's names are the package's: a site's own composite, for a
dispatcher the site renders itself, takes a name of its own, need not
spread the slot, and then arms no type under `siteTypes`; a map that does
over a composite with no slot throws on the first such node.

A site with types of its own takes three steps: it compiles the
package's documents against its own schema, excluding `src/lib/site/`
from its compile; it defines the five fragments itself; and it makes its
bundler run the package's dispatchers on its own compile, as the last
paragraph of this section describes. Each fragment spreads its arms'
fragments aliased by the type they are on:

```graphql
fragment SiteCardSlot_node on Node {
  __typename
  ...StationCard_node @alias(as: "Station")
  ...LineCard_node @alias(as: "Line")
}
```

The component that defines that fragment is the site's dispatcher for the
form: it reads the slot's key, switches on the typename it receives, and
renders the arm over that type's aliased key. The site lists it in its
maps under `siteTypes`, once per typename it arms:

```tsx
const maps: ProjectionMaps = {
  ...defaultProjectionMaps,
  card: {
    ...defaultProjectionMaps.card,
    siteTypes: { Station: SiteCardSlot, Line: SiteCardSlot },
  },
};
```

The package's dispatchers import the composites' artifacts their own
compile writes, which spread the default slots. A site that defines the
slots must therefore configure its bundler to resolve the package's
artifact imports, `…/__generated__/<Name>.graphql.js` from any package
source its `relay.config.json` lists, to the artifacts of the same name
its own compile writes; without that step its arms find no data under
their slot and throw on the first node. The package does not ship this
step: a bundler loads its configuration under Node, which does not run
a source-shipped package's TypeScript. The metro app's Vite plugin,
`apps/react/prism-metro/src/relay/redirectPackageArtifacts.ts`, is the
reference implementation a site copies.

## List view

`NodeList` renders an index of nodes as `EntityList`: a plural fragment on
`Node` spreads the card and the row composites, and each node renders as a
card in the cards view and as a row in the rows view, through its type's
arm. It keeps no view of its own: the lens holds the view in the page's
address and passes it back with the count line and the empty line.

```tsx
<NodeList
  count={data.instanceCount}
  kind={t("index.kind")}
  nodes={data.instances.edges.map(({ node }) => node)}
  onViewChange={setView}
  view={view}
/>
```

## Prose links

A page's prose may link to graph nodes, by absolute IRI or compact address,
in plain CommonMark: `[Button](ds:global.component.button)`. The provider
resolves the nodes a passage links to and serves them as a `NodeConnection`;
the page spreads `ProseReferencesProvider_references` on it and provides it
around the prose. `markdownComponents` is the element-override map a
Markdown renderer takes: its `a` renders a link whose href names one of the
references as that node's `ChipProjection`, labelled with the author's
text and linked to the node's home, and any other link as the plain anchor its
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

- Dispatchers: `ChipProjection`, `RowProjection`, `CardProjection`,
  `CommandProjection`, `GraphNodeProjection`; types `ChipProjectionProps`,
  `RowProjectionProps`, `CardProjectionProps`, `CommandProjectionProps`,
  `GraphNodeProjectionProps`, `ChipArmNative`, `RowArmNative`,
  `CardArmNative`, `CommandArmNative`, `GraphNodeArmNative`.
- Node projections: `NodeChip`, `NodeRow`, `NodeCard`, `NodeCommand`,
  `NodeGraphNode`; types `NodeChipProps`, `NodeRowProps`, `NodeCardProps`,
  `NodeCommandProps`, `NodeGraphNodeProps`.
- List view: `NodeList`; types `NodeListProps`.
- Class projections: `OntologyClassChip`, `OntologyClassRow`,
  `OntologyClassCard`, `OntologyClassCommand`,
  `OntologyClassGraphNode`; types `OntologyClassChipProps`,
  `OntologyClassRowProps`, `OntologyClassCardProps`,
  `OntologyClassCommandProps`, `OntologyClassGraphNodeProps`.
- Property projections: `OntologyPropertyChip`, `OntologyPropertyRow`,
  `OntologyPropertyCard`, `OntologyPropertyCommand`,
  `OntologyPropertyGraphNode`; types `OntologyPropertyChipProps`,
  `OntologyPropertyRowProps`, `OntologyPropertyCardProps`,
  `OntologyPropertyCommandProps`, `OntologyPropertyGraphNodeProps`.
- Representations: `EntityChip`, `EntityRow`, `EntityCard`,
  `EntityCommand`, `EntityGraphNode`, `EntityList`; types
  `EntityChipProps`, `EntityRowProps`, `EntityCardProps`,
  `EntityCardKeyValue`, `EntityCommandProps`, `EntityGraphNodeProps`,
  `EntityListProps`, `EntityListView`.
- Maps: `ProjectionsProvider`, `useProjectionMaps`, `useProjectionLink`,
  `renderArm`, `defaultProjectionMaps`; types `ArmProps`, `ProjectionArm`,
  `ProjectionMap`, `ProjectionMaps`, `ProjectionsProviderProps`,
  `SiteArmProps`.
- Prose: `markdownComponents`, `ProseReferencesProvider`; types
  `ProseLinkProps`, `ProseReferencesProviderProps`.
- Addresses: `findCuriePrefix`.
