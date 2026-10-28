# @canonical/surface (shim)

**A local shim of the surface ontology**, to be replaced by the published
`@canonical/surface` package of the same name. It is private, has no build
step, and exists so the documentation sites of this repository load their
demand model the same way they load every other ontology: as an installed
package.

The surface ontology is the demand model a documentation site is specified
against. A [job](definitions/Job.md) is one thing a consumer is trying to
get done; a [coordinate](definitions/Coordinate.md) says who has it; a
[surface](definitions/Surface.md) is a place where a consumer meets the
graph; a [pairing](definitions/Pairing.md) says which surface serves which
job, in which role and at what cost of reorienting; and a layout's slots say
which job summons each of its regions. The journeys lens of the docs site
reads this model.

## How it is loaded

The pragma provider (`packages/prism/pragma-provider`) compiles every
package it names in `REF_PACKAGES` from `node_modules`. This package is one
of them, and a dependency of the provider, so `bun install` links it into
`node_modules/@canonical/surface` exactly as it installs the published
`@canonical/design-system`. Nothing is optional: no environment variable,
no second source root, no code path for a missing model.

The instance data of the docs site is the sibling shim,
[`@canonical/design-system-docs`](../design-system-docs/README.md).

## Layout

| Path | Holds |
|---|---|
| `definitions/surface.ttl` | the classes and properties, one `rdfs:comment` each |
| `definitions/shapes.ttl` | the SHACL cardinality shapes |
| `definitions/*.md` | prose sidecars, one per class they describe (`Job.md` describes `surface:Job`) |
| `data/*.ttl` | the base vocabulary: actors, arrivals, authority families, dimensions, fluencies, regions, validities and verdicts |

Conventions:

- One prefix, `surface:` for `<sem://surface#>`, for definitions and data:
  classes in PascalCase, properties in camelCase, instances in lowercase
  snake_case (`surface:cold_entry`).
- Every class and property carries an `rdfs:comment`. The GraphQL compiler
  copies it into the schema as the description of the type or field, so a
  changed comment is a changed schema: the docs site's `schema:check` shows
  it.
- Descriptions come from `rdfs:comment` only, never `skos:definition`,
  which the compiler would prefer.
- Cardinality comes from `shapes.ttl` (`sh:maxCount 1` makes a field
  singular), never from `owl:FunctionalProperty`.
- `surface:Surface` has subclasses and no direct instances, so it compiles
  to a GraphQL interface. Data types a surface as one of the subclasses,
  never as `surface:Surface` itself.
- Instances are named IRIs, never blank nodes, which the compiler would
  embed rather than expose as nodes.
- `surface:Lens` binds `graphql:name "LensSurface"`: the plural of "lens" is
  "lens", so the class name would mint the same root field twice.

## Retiring the shim

When `@canonical/surface` is published:

1. Delete this folder.
2. In `packages/prism/pragma-provider/package.json`, pin the published
   version of `@canonical/surface`, then run `bun install` twice.
3. In `apps/react/pragma-docs`, run `bun run schema` and review the diff of
   `src/relay/schema.graphql`.
