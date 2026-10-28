# @canonical/design-system-docs (shim)

**A local shim of the pragma documentation site's demand model**, to be
replaced by the published `@canonical/design-system-docs` package of the
same name. It is private, has no build step, and holds only Turtle and
prose.

It instantiates the [surface ontology](../surface/README.md) for this
repository's docs site (`apps/react/pragma-docs`): the jobs that the design
system's designers, engineers, maintainers and their agents have; the
coordinates and personas they belong to; the site's surfaces (the lobby,
the Components catalogue, a component's page, Definitions, Standards, the
guides, Journeys, the playground, the chips, the command palette and the
GraphQL port); the pairings between jobs and surfaces; the slots of the
design system's layouts and the real UI blocks that fill them; and the
bets, laws and exemplars the site's design leans on. The journeys lens
renders this model.

## How it is loaded

The pragma provider compiles every package it names in `REF_PACKAGES` from
`node_modules`. This package is one of them, and a dependency of the
provider, so `bun install` links it into
`node_modules/@canonical/design-system-docs` like the published ref
packages. It declares no dependency on `@canonical/surface` or
`@canonical/design-system`, whose terms it uses, in the same way the design
system's own data declares none on the vocabularies it uses: the provider
compiles them all into one graph.

## Layout

| Path | Holds |
|---|---|
| `data/roles.ttl`, `data/coordinates.ttl`, `data/personas.ttl` | who the site is for |
| `data/jobs.ttl` | the jobs, each with its story, acceptance clauses and coordinates |
| `data/surfaces.ttl` | the site's surfaces, each typed as its idiom, with the layout it composes |
| `data/layouts.ttl` | the slots of the design system's layouts, and the UI blocks that render in them |
| `data/pairings.ttl` | the job and surface pairings |
| `data/capabilities.ttl` | the graph, what can be done with it, and who is granted what |
| `data/assumptions.ttl`, `data/exemplars.ttl` | the bets, the laws and the walked stories |
| `data/homes.ttl` | the lens each kind of entity is at home in |
| `data/*.md` | prose sidecars, named after the entity they describe (`view.home.md`) |

Conventions:

- `dsd:` is `<sem://design-system-docs#>`; instance names are lowercase and
  dotted (`dsd:job.l3`, `dsd:view.components`), with snake_case inside a
  segment. A pairing is named `<job>.<surface>` without a kind word
  (`dsd:l3.components`): the journeys graph cuts a hop's label at 20
  characters and names its kind on a line of its own, so the surface that
  tells two pairings of one job apart stays inside the cut.
- Every instance carries an `rdfs:label` and an `rdfs:comment`.
- The design system's entities are named by their real addresses
  (`ds:global.component.card`) and never typed here; this package only
  attaches demand to them. Every file that names them declares
  `ds: <https://ds.canonical.com/>` exactly as the design system does.
- Surfaces are typed as a subclass of `surface:Surface`, never as
  `surface:Surface` itself, and every instance is a named IRI.

## Retiring the shim

When `@canonical/design-system-docs` is published:

1. Delete this folder.
2. In `packages/prism/pragma-provider/package.json`, pin the published
   version of `@canonical/design-system-docs`, then run `bun install` twice.
3. In `apps/react/pragma-docs`, run `bun run schema` and review the diff of
   `src/relay/schema.graphql`.
