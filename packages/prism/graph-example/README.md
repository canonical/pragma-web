# @canonical/prism-graph-example

A **second, hand-written implementation of [`@canonical/prism-contract`](../contract)**,
serving a fictional metro network.

It exists so that one sentence in the Prism acceptance criteria becomes runnable rather
than rhetorical:

> the lenses render against a provider that has never heard of pragma.

Everything here is built to make that measurable. If the contract were secretly shaped
around ke-graphql, or secretly required a compiler, this package is where it would show
— as awkwardness, as a field that cannot be answered, or as a line count that runs away.
Two of those three happened. They are written down below rather than smoothed over.

> **Deliberately not published.** `"private": true`. A new public package needs a manual
> first `npm publish --access public` plus human OIDC trusted-publisher setup before
> release automation works, and a reference implementation whose only consumer is this
> repository should not need that to merge. Flipping it later is a one-line change:
> drop `"private"`, add `"publishConfig": { "access": "public" }`.

---

## Why it does not use ke-graphql

ke-graphql could produce a conformant schema from a metro ontology in an afternoon. That
would prove almost nothing.

- **It would be the same engine over different data.** One compiler satisfying the
  contract twice measures the compiler, not the contract.
- **It inverts the arrow.** The compiler *derives* a schema from an ontology; the
  contract is *authored*. Conformance-by-compiler therefore degrades into shaping the
  data until the compiler happens to emit the right names — which is a test of patience,
  not of the specification.

So this provider is `buildSchema(sdl)` and plain TypeScript objects. It starts **from**
the authored contract SDL, which it reads at runtime from `@canonical/prism-contract`,
so it cannot drift from it: change the contract and this package's contract gate is red
on the next run.

### `mode` and `prefixing` do not apply here

`mode` (`"auto" | "annotated" | "explicit"`) and `prefixing` are **ke-graphql compiler**
options. They govern how the compiler derives GraphQL names from an ontology.

**This provider derives nothing.** It implements the contract's fixed, structural names —
`uri`, `_meta`, `instances`, `superclasses`. There is no naming decision to configure,
so neither knob has an equivalent here. Do not go looking for them.

---

## What a provider must add to the contract — Finding A

**`buildSchema(contractSdl)` on its own cannot serve instance data.**

The contract declares exactly one type that `implements Node`: `OntologyClass`. So a
`NodeConnection` returned by `OntologyClass.instances` can legally contain nothing but
ontology classes. There is no type an ABox entity could *be*.

Every provider therefore extends the contract SDL with its own concrete `Node`
implementers. That extension is precisely what the contract's superset rule exists for:

```ts
const sdl = readContractSdl() + readExtensionSdl();   // src/lib/provider/providerSdl.ts
```

`schema/extension.graphql` adds the `Node` implementers `Line`, `Station`,
`Interchange` and `Zone` for the network and `RollingStock`, `Formation`, `Unit` and
`CarType` for its fleet, the `Stop` interface over the two station types, and six value
types with no IRI of their own: the embeddable `GeoPoint`; `Route`, `Call` and
`DiagramPoint`, which carry the network model; and `UnitPosition` and `CarPosition`,
which carry the fleet model (see both below). `findBreakingChanges(contractOnly, extended)` returns zero, and
`satisfiesContract(readProviderSdl())` returns **zero violations**.

**The extension adds two root fields, `prose` and `search`, and no other.** Every entity
type this provider declares is reachable through the contract's own five root fields —
`node(id:)` and `OntologyClass.instances`. Adding provider root fields for them would
have been easier and would have demonstrated less. `prose` and `search` are the
exceptions because neither is part of the contract (see below).

---

## The dataset

A small fictional **metro/transit network**, in `src/lib/provider/dataset.ts`.

The subject matter is load-bearing. pragma's own graph is design systems, components,
code standards, jobs, personas, surfaces and layouts. A transit network shares **no**
vocabulary with any of it, so nothing here can be mistaken for a pragma fixture that
happens to have been renamed. (Biology and taxonomy were deliberately avoided: a domain
with its own taxonomic ranks blurs the line between the subject's hierarchy and RDFS
subclassing, and this dataset needs that line sharp.)

The file contains **inert records only** — no functions, no getters. All view
construction lives in `createExampleProvider.ts`, which keeps "a provider is some code
and a data file" literally true.

| What is in it | Which contract obligation it discharges |
| --- | --- |
| `metro:Stop` (abstract) → `metro:Station` → `metro:Interchange` | `superclass`, `superclasses` (transitive), `subclasses`, `isAbstract` |
| `metro:Line`, a second root class | `superclass: null` |
| a second ontology `geo:` with no label | `Query.ontologies` > 1, `Ontology.label` nullability |
| `rdfs:Class`, the metaclass | `EntityMeta.type` on an `OntologyClass` — see Finding B |
| `geo:Zone` with real instances, in the **second** namespace | `_meta.curie` must resolve a prefix per entity, not hardcode one |
| `metro:name` (DATATYPE, no domain), `metro:servesLine` (OBJECT, with `inverse`), `metro:note` (ANNOTATION) | all three `PropertyKind` values, `functional`, `inverse`, nullable `domain` |
| 22 stations + 4 interchanges + 2 fare zones, 7 lines | `instances(first/after/last/before)` with real `hasNextPage` |
| four line topologies: linear lines (North, Coastal), a loop run both ways (Circle), two linear lines closing a ring between shared termini (Upland, Lowland), a ring run by two lines in opposite directions (Ringway Clockwise, Ringway Anticlockwise) | the network model a map or a line strip needs — see the network section |
| `metro:Route`, `metro:Call`, `metro:DiagramPoint`, `metro:UnitPosition`, `metro:CarPosition`, value classes with no instances | `_meta` on a value type: `type` resolved, `curie` the typename, `title` the label or the typename |
| `metro:RollingStock`, `metro:Formation`, `metro:Unit`, `metro:CarType`, further root classes: 3 stocks, 4 formations, 3 units and 7 car types | Nodes beyond the network, reached through `node(id:)` and `OntologyClass.instances` alone |
| six formation cases: a fixed formation (Series 70), one unit run alone or coupled (Series 90 three-car and six-car), an asymmetric unit reversed in its formation (Series 50 four-car), one stock in different lengths per line (Series 90 on the North and Upland lines), a formation longer than a platform (the six-car at Marsh End), a line run by two stocks (Coastal) | the fleet model a formation diagram needs — see the fleet section |
| `metro:code`, `metro:position`, `metro:formations`, `metro:length`, `metro:capacity`, `metro:reversed`, global properties two types answer to | a property's local name is the field it projects, so a field two types share is one property with no `domain` |
| `metro:reverse`, declared its own `inverse` | a symmetric property: `OntologyProperty.inverse` pointing at itself |
| `metro:ghost` — **no descriptive predicates at all** | the local-name tier of `_meta.title` |
| a test-only station at `https://metro.example/onto#` — **IRI with an empty local name**, never served: the namespace IRI is the ontology's own address | the whole-IRI tier of `_meta.title` |
| `geo:GeoPoint`, an embeddable with no `uri` | the typename tier of `_meta.title` |
| a station labelled `{"": "Northgate", "fr": "Porte-Nord"}` | `title(lang:)` / `label(lang:)` are genuinely implemented, not accepted and ignored |
| instance IRIs that live **inside** the declared namespaces | `_meta.curie` can compact at all — see the curie section |

The embeddable is **not required by the contract** — nothing in the contract references a
non-Node value type. It is here to reach `_meta.title`'s last tier and to show that a
provider may add value types freely.

---

## The network: routes, calls and the diagram

The lines carry enough structure to draw a schematic map and a line strip from GraphQL
alone. The model is a provider extension: the contract is unchanged, and every type is
reached through `node(id:)` and `OntologyClass.instances` like the rest.

- **Direction is data.** A `Line` has `routes`, and each `Route` is one direction of the
  line's service. The route, not the line, carries the ordered `calls`, so a line that
  runs both ways has two routes, each in the order a passenger meets the stops.
- **`Route.label`** is the name shown to passengers ("To Marsh End", "Clockwise"). It is
  the route's `rdfs:label`, so it agrees with `_meta.label` and `_meta.title`.
- **`Route.isLoop`** means the service continues from the last call back to the first.
  The first stop is never repeated at the end.
- **`Route.reverse`** is the same line's route over the same stops the other way. For a
  loop that is the same first stop with the rest reversed. It is null when the line runs
  one direction only: a ring run by two lines in opposite directions is two lines, so
  neither route has a reverse. `metro:reverse` is symmetric, and declared its own
  inverse.
- **`Call.position`** counts from 1, with no gaps.
- **`Line.code`** is the short code passengers know the line by, and **`Line.colour`** a
  lowercase `#rrggbb` triplet. Both are non-null.
- **`Stop.diagramPosition`** is a `DiagramPoint` in whole grid units on a schematic, not
  a geography (`Stop.location` is the geography). The origin is the north-west corner,
  `x` grows east and `y` grows south, the orientation of a screen, so a drawing needs no
  flip; the network is anchored so its smallest `x` and `y` are both 0. Every segment
  between consecutive calls, and the closing segment of a loop, is horizontal, vertical
  or diagonal. The 25 routed stations have a position; the bare station has none.
- **`servesLine` and `servedBy` agree with the calls.** Each is stated in the dataset,
  and `src/testing/integration/lineMembership.test.ts` derives each from the routes and
  requires them to match. A station where lines serving different stops meet is an
  interchange; the Ringway stations are served by two lines over the same stops, so they
  stay plain stations.

One integration test per topology (`lineTopologies.test.ts`) and one for the diagram's
geometry (`networkDiagram.test.ts`) read the network through GraphQL, never from the
dataset file.

---

## The fleet: stock, formations, units and cars

The lines are run by a fleet, modelled closely enough to draw each train to scale from
GraphQL alone. Like the network, it is a provider extension: the contract is unchanged,
and `RollingStock`, `Formation`, `Unit` and `CarType` are Nodes reached through
`node(id:)` and `OntologyClass.instances`.

- **A formation is an ordered list of units, each possibly reversed; a unit is a set of
  cars permanently coupled in order.** `Formation.units` lists `UnitPosition`s and
  `Unit.cars` lists `CarPosition`s, value types with no IRI of their own.
- **Lengths are whole millimetres, measured over couplers**, so they add up without
  gaps. **`capacity` is passengers seated plus standing.**
- **Only car types store measures.** `Unit.length` and `capacity` are the sums of its
  cars' car types, and `Formation.length` and `capacity` the sums of its units; the
  provider computes both and the dataset states neither.
- **Positions count from 1 with no gaps**, from the formation's or the unit's front.
- **`UnitPosition.reversed`** means the unit runs last car first. **`CarPosition.reversed`**
  means the car's leading end faces the rear of its unit. **`CarType.hasCab`** means a
  driving cab at the car's leading end. A car's orientation in the train is its own
  `reversed` XOR its unit's, which is what a drawing needs to put cab ends right: the
  Series 50 unit has one cab, and two of them back to back, the second reversed, make a
  train with a cab at each end and none inside.
- **`RollingStock.formations`** holds the stock's alternatives in authored order,
  shortest first. **`Line.formations`** lists the formations a line is run with, and a
  line may be run by more than one stock. **`Formation.stock`** is the stock that lists
  the formation and **`Formation.lines`** the lines whose formations list it, in IRI
  order; both are read as inverses, never stored. A formation no stock lists fails its
  non-null `stock` rather than being handed an invented one.
- **`Stop.platformLength`** is the usable length of the station's shortest platform, in
  the same millimetres, so it compares with a formation's length directly. It is null
  for a station no route calls at. One formation overhangs one platform: the Series 90
  six-car at Marsh End on the North Line.
- **Shared fields are shared properties.** A property's local name is the field it
  projects, so `metro:code` (a line's and a car type's), `metro:position` (a call's and
  a car's or unit's place), `metro:formations` (a line's and a stock's), and
  `metro:length`, `metro:capacity` and `metro:reversed` are global properties with no
  `domain`.

`fleetMembership.test.ts` checks every computed measure and inverse against what it is
computed from, and `fleetFormations.test.ts` reads each formation case off the record
that exhibits it, both through GraphQL.

---

## `_meta.title` by hand — the verdict

`title(lang: String = "en"): String!` is **non-null**, so every provider owes a total
fallback chain. The ticket suspected this would be the awkward part. It is not.

The whole of it, in `src/lib/provider/descriptive.ts`:

1. the asserted label for the requested language, else the untagged literal
2. else any asserted literal in any language
3. else the IRI's local name
4. else the whole IRI
5. else the GraphQL typename (reachable only for something with no IRI — an embeddable)

**Verdict: writing it by hand was trivial, not awkward — eight lines of body, and a point
in the base's favour.** Two honest caveats:

- It is trivial *partly because* this provider chose a shape (a language → string map)
  that mirrors RDF literals. A provider whose records have a plain `name: string` writes
  `name ?? localName(uri)` and is done in two lines. Either way `title`'s totality costs
  nothing worth arguing about.
- What is genuinely expensive is not `title`. It is `type` and `fields` — see Finding B.
  The easy win here should not be allowed to obscure that.

The gate for this (`src/testing/integration/titleTotality.test.ts`) is driven **from the
dataset**, never from a hand-listed set of URIs: every entity, every class, and every
embeddable is checked, including in a language nobody wrote.

---

## Finding B — the contract makes a TBox mandatory

`EntityMeta.type: OntologyClass!` and `EntityMeta.fields: [ClassProperty!]!` are
**non-null**. A provider whose data is a flat list of records therefore **cannot be
conformant without inventing an ontology**.

This is the single largest cost the contract imposes on a hand-written provider, and it
is the honest answer to "is the base implementable without the compiler": yes — but only
if you are willing to author a TBox alongside your data.

It is arguably the correct design; self-description is the contract's whole premise. But
it is a *consequence*, and it should be stated rather than discovered. Measured cost, in
`createExampleProvider.ts`:

| Region | Code lines |
| --- | --- |
| TBox views and traversal (`ancestorsOf`, `fieldsOf`, `propertyView`, `classPropertyView`, `classView`, `nullableClassView`, `superclassOf`) | **95** |
| the `_meta` wrapper itself (`metaView`) | **20** |
| **total attributable to the non-null TBox** | **115** |
| everything else in the function body (entities, routes, calls, diagram points, the fleet, connections, ontologies, root fields) | 346 |

Each region counts the code lines from a declaration to the next one in the function
body, with the filter given under Size below. A quarter of the function body (115 of 461
lines) is TBox machinery that exists only because those two fields are non-null, and
most of the rest serves this provider's own network and fleet models: of the 252 body
lines that serve the contract alone, the TBox is nearly half. A `type: OntologyClass`
(nullable) and `fields: [ClassProperty!]` (nullable) would let a flat-record provider
conform with far less code.

One side effect worth naming: because `OntologyClass` itself implements `Node`, a class
needs a class. This dataset declares `rdfs:Class` for that, which is an instance of
itself — so the tower terminates honestly rather than by fiat.

---

## Finding C — `_meta.field(name:)` had no defined key. **The contract closed it.**

Building this provider surfaced a real hole. `_meta.fields` returned `[ClassProperty!]!`,
and neither `ClassProperty` nor `OntologyProperty` exposed anything called `name` — so a
client that enumerated `_meta.fields` **could not derive a legal argument for
`_meta.field(name:)`**. The argument round-tripped through nothing. It worked in
ke-graphql only because there `name` means "the GraphQL field name the compiler derived",
a *compiler* concept leaking into a surface that claims to be provider-neutral.

**`ClassProperty` now carries `name: String!`.** The argument round-trips properly:
enumerate `_meta.fields`, read `name`, pass it straight back to `field(name:)`.

### What this provider puts in `name`, and why it has to say so

The contract can require the field but cannot say what a *hand-written* provider should
put in it — "the name the compiler derived" means nothing where nothing is derived. So
each provider states its own rule. **This one serves the property IRI's local name:**

| `property.uri` | `name` |
| --- | --- |
| `https://metro.example/onto#platformCount` | `platformCount` |
| `https://geo.example/onto#inZone` | `inZone` |

`_meta.field(name:)` matches **that exact value and nothing else** — passing the full IRI
returns null. Accepting extra aliases would make "the value `fields` publishes" stop
being the whole answer, which is the property worth having.

The one caveat: local names are not globally unique, so two properties from different
namespaces with the same local name would collide on one class. This dataset has none;
a provider whose ontology does should serve the curie (`geo:inZone`) instead — which the
contract now makes derivable, since `_meta.curie` and `Query.ontologies` are both public.

---

## `_meta.curie` by hand — the second verdict

`curie: String!` is the compact display form of the entity's IRI: `metro:northgate` for
`https://metro.example/onto#northgate`. Like `title`, it is **non-null**, so it is a
totality obligation.

**Verdict: not awkward — eight lines — but only because the dataset was honest about its
namespaces.** The implementation is:

> the declared prefix of the **longest** namespace the IRI starts with, plus the
> remainder; the whole IRI if nothing matches.

Three things are worth reporting:

1. **It resolves against `dataset.ontologies` — the very prefix/namespace pairs
   `Query.ontologies` publishes.** So a client can derive exactly the same string itself;
   the field is a convenience, never a secret. There is a test that does precisely that
   derivation and asserts it matches. A `curie` computed from anything a client cannot
   see would be a much worse field.
2. **Longest-match matters.** First-match would let a namespace shadow a longer one that
   extends it. That is two words of code, but getting it wrong is silent.
3. **It forced a real dataset change, and that is the interesting part.** Instance IRIs
   originally lived at `https://metro.example/stop/…` while the ontology lived at
   `https://metro.example/onto#…`. That is normal RDF practice, but it means **instances
   are in no declared namespace** and every curie would have degraded to the full IRI.
   Serving `curie` well is therefore a constraint on how a provider *names its data*, not
   just on how it answers a field. Instances moved into the declared namespaces, and a
   `geo:Zone` class with real instances was added so that entities genuinely span two
   prefixes — otherwise an implementation that hardcoded `metro:` would have passed every
   test. The totality gate asserts that more than one prefix appears across the dataset.

Edge cases, all gated: an IRI whose local name is empty compacts to a bare `metro:`; the
embeddable, having no IRI of its own, answers its **GraphQL type name** (`GeoPoint`).
That last one is the contract's own third tier, quoted: "for a value with no IRI at all
(an embedded blank node) — the GraphQL type name". Compacting the embeddable's CLASS
instead (`geo:GeoPoint`) reads better in isolation and is the wrong answer; a provider
whose job is to demonstrate the contract does not get to serve a nicer one. The typename
tier is also the tail `_meta.title` falls back to, so the two agree.

---

## Size — measured, not estimated

The ticket's premise was "a provider is ~150–200 lines and a data file". Here is what it
actually took. Code lines exclude blank lines and comments; "with docs" is the physical
file length in this repo's TSDoc-heavy house style.

The counts are taken with these commands, from the package root, so they can be taken
again rather than estimated:

```bash
grep -cvE '^\s*($|//|/\*|\*)' src/lib/provider/createExampleProvider.ts   # TypeScript
awk '/^"""/{d=!d;next} !d && !/^[[:space:]]*(#|$)/' schema/extension.graphql | wc -l   # SDL
wc -l src/lib/provider/createExampleProvider.ts   # with docs
```

| Module set | Code | With docs |
| --- | --- | --- |
| `createExampleProvider.ts` | 536 | 798 |
| `connection.ts` (Relay paging) | 58 | 126 |
| `providerSdl.ts` (SDL loading) | 33 | 79 |
| `descriptive.ts` (**the whole `_meta.title` chain**) | **28** | 64 |
| `sumMeasures.ts` + `isNetworkEntity.ts` (fleet helpers) | 16 | 28 |
| barrels (the four `index.ts`) | 18 | 55 |
| **provider runtime total** | **689** | **1150** |
| `dataset.ts` (the data file — inert records) | 1298 | 1425 |
| `types.ts` + `constants.ts` (declarations only) | 139 | 308 |
| HTTP server (`createExampleHandler` + GraphiQL) | 95 | 161 |
| `schema/extension.graphql` | 116 | 321 |
| tests + test infrastructure (every `*.test.ts` and `src/testing/*.ts`) | 4103 | 5226 |

**689 code lines against a 150–200 target — roughly 3.4×.** 249 of them serve this
provider's own models rather than the contract: 69 the network (routes, calls and
diagram points) and 180 the fleet (stocks, formations, units, car types and platform
lengths). Without them the provider is 440 lines, roughly 2.2×.
Where it goes, and which parts are anybody's fault:

1. **The contract declares 54 fields** across `Node`, `EntityMeta`, `PageInfo`,
   `NodeConnection`, `NodeEdge`, `Ontology`, `OntologyClass`, `ClassProperty`,
   `OntologyProperty` and `Query` (52 before `ClassProperty.name` and `EntityMeta.curie`).
   A provider must answer every one. At the ~4.5 lines per field this implementation
   averages, **the 150–200 target was unreachable before a line was written** — it appears
   to have been set without counting the contract's surface. That is the main correction
   to the original estimate, and it means the target should be restated as a function of
   the contract's size rather than as a constant.
2. **The mandatory TBox (Finding B) is 115 of those lines** — 95 of TBox views and
   traversal plus the 20-line `_meta` wrapper, out of a 461-line function body. This is
   the one number that is genuinely evidence *about the converged base*, and the only one
   a contract change could meaningfully reduce.
3. **Relay paging is 58 lines and is not the base's fault.** `first/after/last/before` on
   `OntologyClass.instances` is Relay's cost and would be present in any
   connection-shaped specification.
4. **`_meta.title` is 28 code lines including all five fallback tiers**, and
   **`_meta.curie` is 8** — the two totality obligations the ticket most suspected both
   came out cheap. The expensive obligation was the one nobody flagged: the non-null TBox.
5. **The two new fields cost ~12 lines of permanent code between them** (`curieOf` 8,
   `ClassProperty.name` 1, `_meta.curie` 1, the `inZone` relation 3). Adding fields to
   this contract is cheap for providers; it is the *non-null* ones that carry structure
   behind them that are not.

---

## Prose — a provider extension, hand-written

`Query.prose(uri: ID!): Prose` serves long-form Markdown for an entity, the same
extension the pragma provider serves, written here by hand:

```graphql
type Prose {
  markdown(lang: String): String!
  lang: String!
  availableLanguages: [String!]!
  references: NodeConnection!
}
```

It is a root field rather than a field on `Station` because a compiled provider can
extend only the object types it generates and `Query`, never `Node`; a root field is the
one position a reader can select the same way against both providers. An `extend type
Query` in a schema file reads as a client extension to relay-compiler, so a consumer
that compiles operations against this provider prints the built schema rather than
reading `schema/extension.graphql` raw.

Northgate (`metro:northgate`) carries prose in English and French. The text in `lang`
is served when authored, else the language the request's `x-prism-locale` header names,
else English, the default every entity with prose must have; matching is exact, with no
subtag fallback. Links whose destination is a declared-prefix CURIE (`metro:north-line`,
`geo:central-zone`) or an absolute IRI are references, resolved as `node(id:)` would
resolve them, class IRIs included; links in code, and links to anything the dataset does
not hold, are not. `extractReferences.ts` is the pragma provider's function, copied rather
than imported so the two packages stay independent.

---

## Search — hand-written

`Query.search(text: String!, first: Int, after: String): NodeConnection!` finds nodes by
what they are called, the same extension the pragma provider serves, written here by
hand over the records and classes `node(id:)` already serves.

The text is trimmed and lowercased; empty text, or text that is only whitespace, matches
nothing. A node matches when its title, its CURIE or its definition contains the text,
ignoring case, and the first of the three that does decides the match: a title match
ranks before a CURIE match, and a CURIE match before a definition match. Within one, an
earlier position ranks first, then a shorter title, then the title, then the IRI, each
string compared by code unit and never by locale. Titles and definitions are read in
`en`, the default `_meta` falls back to. The ranked IRIs page through `sliceConnection`,
like every other connection here: 20 a page unless `first` says otherwise, an unknown
`after` starts from the head, a negative `first` is an error, and `hasPreviousPage` is
true after a cursor. The two providers differ there, as the contract leaves them free to;
a client that wants a page size passes `first`.

`matchSearchEntry.ts` and `rankSearchEntries.ts` repeat the pragma provider's functions
of the same names on purpose. This package depends on the contract and `graphql` and on
nothing of pragma's, so that it stays an independent second implementation; sharing the
ranking would make the two providers agree by construction rather than by test.

---

## Running it

```bash
bun run serve                       # http://127.0.0.1:5176/graphql, with GraphiQL
NODE_ENV=production bun run serve   # no GraphiQL, no CORS
```

Port 5176 so it never collides with the docsite's own graph on 5175 — the point is to run
both and see the same lenses render against either.

```bash
bun run check   # biome + tsc --noEmit + webarchitect
bun run test    # vitest with 100% coverage thresholds
```

The HTTP handler is ~70 lines and is **deliberately not** ke-graphql's
`createGraphQLHandler`: that one is 505 lines and imports the other graphql major pinned
in this repo, so reusing it would put two graphql instances in one process — and it would
contradict the premise that this contract is implementable without pragma's machinery.

---

## The lens gate, and the two things it does not guard

`src/testing/integration/lensOperations.test.ts` harvests **every** query operation
declared under its two scan roots — `apps/react/pragma-docs/src/domains/guides/**` and the
`src` of every lens package, `packages/prism/lens-*/src/**`, together the docsite's **core
lens set** — at run time, from the Relay artifacts, never from a snapshot, and executes each
one against this provider. The app's artifacts are committed; a lens package's are build
outputs its `build` script compiles at install, so the gate needs a `bun install` first.

It started life red by design, as a to-do list. **It is now green.** The definitions lens
and the standards lens were despecialised onto the contract and execute here:
`DefinitionsExplorerQuery`, `StandardsIndexQuery`, `StandardsIndexPaginationQuery` and
`StandardEntityQuery` — four operations, zero failures.

**Four out of the docsite's ten shipped query operations.** That denominator
belongs next to the numerator, because the other six do not execute against
this provider and the scan roots do not say so on their own:

| Where | Operations | Why they do not run here |
| --- | --- | --- |
| `src/domains/components` | `ComponentsCatalogQuery`, `CatalogListPaginationQuery`, `ComponentEntityQuery` | select `Component` / `Query.component` |
| `src/domains/marketing` | `LobbyQuery` (the home page) | selects `Component` |
| `src/domains/playground` | `ComponentProbeQuery` | selects `Query.component` |
| `src/domains/journeys` | `JourneysExplorerQuery` | selects `jobs` |

All six name pragma-ontology terms this provider's dataset has no class for.
So what this gate establishes is narrow and worth stating narrowly: **the four
core lens operations are provider-neutral.** It does not
establish that the docsite as a whole runs against any conformant provider —
five mounted routes, the home page among them, currently do not. Widening the
app's scan root to `src/domains` is the intended direction and would turn this gate
red today; that red would be the to-do list, which is the state this gate was
designed to be useful in.

### The core set, and the one thing outside it

The last red operation was `JourneysExplorerQuery`, which joins four ontology-derived root
fields and walks eleven ontology-derived properties. It was never fixable by rewriting the
operation: **the contract has no field anywhere that returns the value of an arbitrary
property on an arbitrary entity** (`EntityMeta.field(name:)` returns cardinality metadata,
not a value), and generic instance-level relation traversal is all that lens is. The
README used to say the resolution was an owner's decision. **The owner decided**, in these
words: *"keep it on side for now, it will be an add-on plugin not a core view."*

Journeys is therefore **no longer a core lens**. It lives at
`apps/react/pragma-docs/src/domains/journeys/**`, which this gate does not scan — and it is
still fully built, routed, listed in the rail, and covered by its own tests in the app.
Nothing was deleted. The journeys domain is a view that is openly
pragma-specific and makes no neutrality claim; journeys is expected to become a plugin
proper once the docsite has a plugin mechanism.

That distinction is the whole point, so state it plainly: **the scanned directories define
an obligation.** Membership of `src/domains/guides/**` or of a lens package *is* the promise to be
provider-neutral. A view either makes that promise and must execute here, or it is an
add-on and does not. There is no third state, and nothing sits in the lens tree with an
exemption.

**An add-on domain is not an escape hatch.** Do not make this gate green by narrowing the
operation set, marking it `it.fails`, adding `skipIf`, gating it behind an env var, or
moving a core operation into the add-on tree — that last one is narrowing the set under a
different name, and it is expressly forbidden. Only an owner reclassifying a view as an
add-on may move one, and the move must land with the reasoning written down (see
`src/domains/journeys/index.ts`). Every other route converts a real signal into a silent
one, and the operation set must stay directory-derived so a new lens is covered the day it
lands. The gate also asserts it discovered a non-zero number of operations, so it cannot
pass vacuously if the app moves.

Going forward, what this gate guards is one specific claim: **no lens operation asks for a
field that exists only because pragma's compiler generated it from pragma's ontology.** It
parses each operation against this provider's schema, executes it, and rejects a result
whose every root field came back null — so an operation cannot pass by looking nothing up.

Two things it does **not** guard, both worth knowing before trusting a green run.

**It does not guard the app's runtime bindings.** The contract's root surface names no
subject, so a lens that enumerates things is handed a class URI from outside the graph.
This gate supplies its OWN (`metro:Station`, in `src/testing/fixtures.ts`); the app
supplies its own from `apps/react/pragma-docs/src/domains/standards/constants.ts`. **The two must never
meet.** Importing the app's binding here would make the gate go green because the app
agreed with itself, when the point is that the operation is neutral about which class it
is pointed at. The consequence is that an operation can be contract-clean here and still
be handed the wrong thing in production — which is why, for example, the standards reading
page carries its own wrong-class guard and its own test for it, in the app.

**It does not guard cursor continuity.** It executes each operation exactly once, with
`cursor: null`. `src/testing/integration/lensPagination.test.ts` covers that separately:
it pages through a real connection, asserts page 2 is non-empty and disjoint from page 1,
and — the load-bearing part — asserts every cursor decodes to the absolute IRI of the node
it belongs to. That bond is the only reason a cursor minted by ke-graphql is located by
this provider and vice versa, and a broken cursor is otherwise invisible: an unrecognised
cursor is answered with page 1 and no error, deliberately, so drift would show up as a
reader stuck on page 1 rather than as a failure.

This gate's natural long-term home is the app, which owns the lenses. It lives here only
because the app could not take a dependency on this package while both were being written.
