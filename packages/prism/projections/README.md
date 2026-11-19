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
`GraphNodeProjection` switch on the node's `__typename`: an ontology
class renders through its own arm, any other type through the `Node` arm
or, when the site gives its switches, the site's switch. A property is no node, so no dispatcher takes
it. `NodeList` lists any nodes through the card and row
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

Every form renders a subsequence of one slot order, mark, prefix, title,
address, kind, summary, facts, status: the chip mark, prefix, title,
status; the row mark, prefix, title, kind, summary, facts, status; the
card all eight, over its Specimen; the command mark, prefix, title,
address, kind, status; the graph node mark, prefix, title, kind, count.
A chip that peeks opens a 248px dialog 4px from it, after
`PEEK_OPEN_DELAY_MS` of hover or at once on focus, inside the viewport;
Escape closes it and gives the link the focus back, and a tap follows
the link.

- **`EntityChip`**: the inline mention, a pill in running text: an
  optional mark, the foreign prefix, the title (a link that peeks at the
  entity's card, or inert text) and an optional status. The mark is a sign
  its projection draws, such as a swatch of the entity's colour; the chip
  hides it from assistive technology, so its name never depends on it.
- **`EntityRow`**: the list entry, one 32px row of an index (56px where an
  index opts into two lines, the summary under the title): an optional
  mark, hidden as the chip's is, the foreign prefix, the title and the
  kind, then the facts and the status at the end. The title yields last:
  a fact with no room leaves whole, the last first.
- **`EntityCard`**: the card, built on the published `Card`: the mark, the
  foreign prefix and the title, the address, the kind, the summary, the
  facts and the status, over its static Specimen, which depicts the
  entity where it has a depiction. The summary ends at its third line, in
  an ellipsis, on every card, on an index and in a peek alike, so the
  cards of a row differ by their facts.
- **`EntityCommand`**: the command-palette result, a two-line row: the
  mark, the foreign prefix and the title over the address, the kind and
  the status at the end.
- **`EntityGraphNode`**: the graph node, native SVG: a `<g>` of a box with
  rounded corners and its `<text>`, the mark, the prefix and the title
  over the kind (50 units tall by default), or the title alone on the middle of a box the
  graph sizes, an optional count (an instance count) at the end of the
  title's line, and the graph's encodings: `hollow` (an abstract class),
  `prominent` (a hub) and `showText` (off when zoomed out), for a graph to
  place with a transform inside its `<svg>`.

- **`SwatchMark`**, **`TokenMark`** and **`TokenSwatch`**: the marks and
  the swatch a colour is drawn by. `SwatchMark` is a 16px disc of an
  entity's own colour (a metro line's), ringed so a pale colour shows;
  `TokenMark` is a 16px square split between a token's light and dark
  values; `TokenSwatch` is the same two values as a token card's
  specimen, under `<EntityCard.Specimen kind="swatch">`. A colour enters
  each only from the entity's data, as an inline custom property; none
  names a colour of its own.
- **`EntityList`**: the shared list view of an index: its children as
  rows in an ordered list (the `table` renderer, the default) or as cards
  in the published `Cards` group, two columns each (the `cards` renderer),
  or one line when it has none. Given `columns` and `rows`, the `table`
  renderer draws `EntityTable`: a header row of sort links and one
  `data-property` cell per column. It has no toolbar: the lens's strip
  switches the renderer and counts the entries.

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
order, and leaves the others empty. A form gives the prefix or the
address, never both: the chip, the row, the card and the graph node give
the foreign prefix, the compact address's namespace (`ds` in `ds:Layout`)
when it differs from the page's ambient namespace, and the command gives
the address. A typed projection gives no kind in the chip, the row, the
card or the graph node, because its mark says what it is; the command and
the `Node` projections give it, since a list of nodes mixes types.

| Projection | Slots |
|---|---|
| `NodeChip` | the node glyph, the foreign prefix, the title, or the passage's own text; it peeks at the node |
| `NodeRow` | the node glyph, the foreign prefix, the title, the node's class as its kind |
| `NodeCard` | the node glyph, the foreign prefix, the title, the node's class as its kind, the definition |
| `NodeCommand` | the node glyph, the title over the compact address, the node's class as its kind |
| `NodeGraphNode` | the node glyph, the foreign prefix and the title over the node's class |
| `OntologyClassChip` | the class glyph, the foreign prefix, the title, or the passage's own text; it peeks at the class |
| `OntologyClassRow` | the class glyph, the foreign prefix, the title, "abstract" for an abstract class; the definition under it in a two-line row |
| `OntologyClassCard` | the class glyph, the foreign prefix, the title, the definition, "Subclass of" its superclass, "abstract" as its status |
| `OntologyClassCommand` | the class glyph, the title over the compact address, "Abstract class", "used in 88 instances" |
| `OntologyClassGraphNode` | the class glyph, the foreign prefix and the title; an abstract class's box is hollow |
| `OntologyPropertyChip` | the property glyph, the foreign prefix, the name, or the passage's own text; it has no peek |
| `OntologyPropertyRow` | the property glyph, the foreign prefix, the name; the definition under it in a two-line row |
| `OntologyPropertyCard` | the property glyph, the foreign prefix, the name, the definition, its domain, range and inverse, "functional" as its status |
| `OntologyPropertyCommand` | the property glyph, the name over its IRI, "kind in domain", the range at the end |
| `OntologyPropertyGraphNode` | the property glyph, the foreign prefix and the name |

A property's name is its label, or the local name of its IRI when it has
none. Every word a reader sees comes from the package's catalog.

Each projection's folder carries a projected `anatomy.yaml`: its root
projects `on` its type, and each slot names the field it reads. The
anatomies suite holds each anatomy's field paths to the compiled
fragment's.

## Switches and the site's switches

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

A switch renders no element of its own: its arm renders the root, and
every arm of one form renders the same representation, so the switch's
native props are that root's. The chip takes `children`, the mention's
text in place of the name.

A switch reads a composite fragment: the node's typename, each arm's
fragment spread aliased by the type it projects,
`...NodeCard_node @alias(as: "Node")` and
`...OntologyClassCard_node @alias(as: "OntologyClass")`, and the site slot,
`...SiteCardSlot_node @alias(as: "Site")`. It switches on the typename:
an ontology class renders through its own arm, any other node through the
`Node` arm. When the site gives its switches (below), every node renders
through the site's switch of the form instead, over the site slot's key.
The package's tests hold each composite's aliases and its switch's
anatomy cases to one set.

Mount `ProjectionLinkProvider` once, inside the router and beside the
site's homes, with the site's router link adapter and its peek:

```tsx
import { HomesProvider } from "@canonical/prism-core";
import { ProjectionLinkProvider } from "@canonical/prism-projections";

<HomesProvider homes={homes}>
  <ProjectionLinkProvider LinkComponent={RouterLink} peek={renderPeek}>
    <Outlet />
  </ProjectionLinkProvider>
</HomesProvider>;
```

A provider nested in another takes what it is not given from the one
above, so a surface that renders its homes through another link keeps the
site's peek and switches.

Every link to a home renders through `LinkComponent`, typed against the
shared `LinkComponentProps` of `@canonical/react-ds-global` and defaulting
to the intrinsic `"a"`. A plain anchor follows a mention with a full
document load, so a site with a client-side router passes an adapter that
renders the router's own link for an `href`; the router then navigates on
the client and the page keeps its state. A site's own projections read the
same link with `useProjectionLink`, so their homes navigate as the
package's arms do.

A chip peeks at its node through the site's peek: `peek`, a function from
a node's absolute IRI (`Node.uri`, the only address `node(id:)` accepts)
to the element the chip shows, typically the site's card switch read by a
query of the site's. Every chip arm takes it with
`peek={useProjectionPeek(data.uri)}`, so no arm imports its site's peek;
without one, chips show the package's `ProjectionPeek`.

A node's or a class's home is resolved with its compact address
(`_meta.curie`) as the `uri` a site's home resolver receives, so one
entity has one address; a property's with its IRI, its only address.

### A site's own switches

A site whose types need their own arms writes a switch of its own per
form: a composite on `Node` that spreads each of its arms aliased by the
type it is on (narrowing an interface's arm to each type with an aliased
inline fragment, `... on Component @alias(as: "Component") { ...UIBlockCard_node }`),
and a component that switches on the typename, with
`requireArmKey` for each case, and renders every other node through its
default. The site's own pages render its switches. Each switch's test is one call
to `expectSwitchCoverage`, and each arm's slot order is held by
`expectSlotOrder`, both from `@canonical/prism-core/testing`.

## The site's switches

The lens packages' queries spread the package's switches, so a site whose
pages render those lenses gives the package its five switches, and a node
of the site's types reaches the site's arm through the package's switch.
The seam is the site slot every composite spreads,
`...Site<Form>Slot_node @alias(as: "Site")`, a fragment on `Node`. The
package ships a default of each, in `src/lib/site/`, that reads the
typename alone, for a site that gives no switches; the package, the lens
packages and any site that compiles the package's documents compile it.

A site that gives its switches compiles the package's documents against
its own schema, excluding `src/lib/site/` from its compile, and defines
the five slots itself, each spreading its switch's fragment, with a
component that hands the slot's data to the switch:

```tsx
fragment SiteCardSlot_node on Node {
  ...MetroCardProjection_node
}

export default function SiteCardSlot({ node, ...props }) {
  return <MetroCardProjection {...props} node={useFragment(nodeFragment, node)} />;
}
```

It gives the five slot components to the provider as `site`
(`{ chip, row, card, command, graphNode }`, typed `SiteSwitches`). Its
switches' defaults take the package's arms directly (the `Node` arm and
the ontology class's): a site switch whose fragment spread the package's
switch would make a fragment cycle through the slot.

The package's switches import the composites' artifacts their own
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
row in the `table` renderer and as a card in the `cards` renderer, through
its type's arm. It keeps no renderer of its own: the lens reads it from
the page's address (`as=`) and passes its name with the empty line. A node
whose type the graph's type lens hides (`_meta.type.visibility` is
`HIDDEN`) is a value, never an entity, so the list skips it.
In the `table` renderer, a list whose nodes share one type up to their
superclasses draws a table of facts from each node's `values` (less the
`omits`), headers sorting by `sort=`; a mixed list keeps the rows.

```tsx
<NodeList
  nodes={data.instances.edges.map(({ node }) => node)}
  renderer={active.name === "cards" ? "cards" : "table"}
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
- Peek: `ProjectionPeek` (the card a chip's peek shows, read at the
  node's absolute IRI by a lazy query of its own when the peek opens),
  `useProjectionPeek` (the peek every chip arm passes its chip: the site's
  own, given to the provider, or the package's); types
  `ProjectionPeekProps`.
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
- Representations: `EntityChip`, `EntityRow`, `EntityCard` (its
  depiction is its static Specimen), `EntityCommand`,
  `EntityGraphNode`, `EntityList`, `EntityTable` (a single-type list's
  table of facts), `LIST_LINES` (the lines a row may take),
  `PEEK_OPEN_DELAY_MS` and
  `PEEK_CLOSE_DELAY_MS` (how long a chip's peek waits to open and to
  close); types `EntityChipProps`, `EntityRowProps`, `EntityCardProps`,
  `EntityFact` (one fact a card or a row states),
  `SpecimenKind`, `EntityCommandProps`, `EntityGraphNodeProps`,
  `EntityListProps`, `EntityListRenderer`, `EntityTableProps`,
  `EntityTableRow`, `EntityTableCell`, `ListColumn` (a table column and
  its sort link), `ListLines`.
- Marks and swatches: `SwatchMark` (the 16px mark of an entity whose
  colour is its own data, such as a line), `TokenMark` (a design token's
  16px mark, its light and dark values side by side) and `TokenSwatch`
  (a token card's swatch specimen, both values each named under its
  well); types `SwatchMarkProps`, `TokenMarkProps`, `TokenSwatchProps`.
- List renderers: `useListRenderers` (the table and the cards, the list
  renderers a site gives its indexes), `ENTITY_LIST_RENDERERS`,
  `DEFAULT_ENTITY_LIST_RENDERER`.
- Site: `ProjectionLinkProvider` (the link, the peek and the site's
  switches; a nested provider keeps what it is not given),
  `useProjectionLink`; types `ProjectionLinkProviderProps`,
  `SiteSwitches`.
- Prose: `markdownComponents`, `ProseReferencesProvider`; types
  `ProseLinkProps`, `ProseReferencesProviderProps`.
- Addresses: `findCuriePrefix`; `AmbientNamespaceProvider`, which
  declares the page's ambient namespace once (a null namespace declares
  none, over a farther one, so every prefix shows), and `useForeignPrefix`, the
  prefix with its colon an identity shows only when its namespace differs
  from it, read from a compact address or, for a property, from
  its namespace (every arm's prefix but the command's, whose address
  states it); types `AmbientNamespaceProviderProps`.
- Colours: `acceptColour` (a colour read from a graph when it is a plain
  colour value, else undefined: the gate every mark passes its colour
  through, for a site that sets a graph's colour in a style itself).
- Switches: `requireArmKey` (the fragment key a switch's case reads,
  throwing when the switch's fragment spreads no arm for the node's type).
