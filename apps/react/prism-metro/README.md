# @canonical/prism-metro

A Prism documentation site over the metro network that
`@canonical/prism-graph-example` serves: a fictional network of stations,
interchanges, lines and fare zones, described by its own ontology. It is
the second site built on the Prism packages, beside the pragma docs, and it
mounts their lenses unchanged over a provider that has never heard of pragma.

It has three lenses:

- **Stations**: an index of every station and interchange, as rows or cards,
  and a page per station with its fields and relations
  (`@canonical/prism-lens-entity`, bound to `metro:Station`).
- **Lines**: the same view of the network's lines (`@canonical/prism-lens-entity`,
  bound to `metro:Line`).
- **Definitions**: the explorer over the metro and geo ontologies' classes
  and properties (`@canonical/prism-lens-definitions`).

## Before you start

Install from the repository root with the Bun version in `.bun-version`. The
install's prepare step builds every package, the lens packages' Relay
artifacts among them, which this app needs to run.

```sh
bun install
```

## Running the app

The app reads its data from the metro graph, which runs in its own process.
Start it first:

```sh
cd apps/react/prism-metro
bun run graph
```

It serves `http://127.0.0.1:5176/graphql`, with GraphiQL on a browser `GET`.
`GRAPH_PORT` moves it to another port. `bun run serve` in
`packages/prism/graph-example` starts the same graph.

Then start the app in a second terminal:

```sh
cd apps/react/prism-metro
bun run dev:bun
```

and open `http://localhost:5178/stations`, `http://localhost:5178/lines` or
`http://localhost:5178/definitions`. `PORT` moves the app to another port.
The site has no page at `/`: the brand in the rail links to the stations
lens.

To read from a graph somewhere else, name its endpoint:

```sh
VITE_GRAPHQL_URL=http://host:port/graphql bun run dev:bun
```

`bun run preview:bun` builds the client and the server renderer and serves
the production build, on the same port and against the same graph.

## Checks and tests

- `bun run check`: lint, type-check, the schema check, and a Relay compile of
  the lens and projection packages' documents against this app's schema,
  which fails when a lens selects something the metro provider does not
  serve.
- `bun run test`: the unit and integration suites; the server and
  integration suites start their own metro graph on a free port.
  `bun run test:coverage` enforces full coverage.
- `bun run test:e2e`: starts the metro graph and each web server script, and
  checks the pages they serve. The preview cells build the app first.

## The schema

`src/relay/schema.graphql` is the metro provider's schema: the Prism data
contract followed by the provider's extension. It is written by
`bun run schema` and checked by `bun run check`, so after the provider
changes, rerun `bun run schema` and commit the result.

## Route names

The lens packages link by route name, so the site's route table and its
`RouterRegister` carry these names:

| Name              | URL                  |
| ----------------- | -------------------- |
| `stations`        | `/stations`          |
| `stationsEntity`  | `/stations/:uri`     |
| `lines`           | `/lines`             |
| `linesEntity`     | `/lines/:uri`        |
| `definitions`     | `/definitions`       |
| `definitionsTerm` | `/definitions/:term` |

An entity or a term is addressed by its compact address, percent-encoded:
`/stations/metro%3Anorthgate`, `/definitions/metro%3AStation`.
