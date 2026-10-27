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

Its landing, at `/`, opens a door to each lens: one card per lens with how
many things it shows, counted from the graph.

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

and open `http://localhost:5178/`. `PORT` moves the app to another port.
`/` is the landing; the brand in the rail leads there.

To read from a graph somewhere else, name its endpoint:

```sh
VITE_GRAPHQL_URL=http://host:port/graphql bun run dev:bun
```

`bun run preview:bun` builds the client and the server renderer and serves
the production build, on the same port and against the same graph.

## Checks and tests

- `bun run check`: the schema check, a Relay compile, lint and type-check.
  `bun run relay` compiles the app's own query together with the lens,
  projection and command-palette packages' documents against this app's
  schema, and fails when a document selects something the metro provider
  does not serve. Its output is not committed: every script that loads the
  app's code or its types runs it first (the dev, graph, build, preview,
  type-check, test and Storybook scripts), so only the schema and Biome
  scripts run without it.
- `bun run test`: the unit and integration suites; the server and
  integration suites start their own metro graph on a free port.
  `bun run test:coverage` enforces full coverage.
- `bun run test:e2e`: starts the metro graph and each web server script, and
  checks the pages they serve, the landing with its counted doors among
  them. The preview cells build the app first. The browser suite reads the
  pages in headless Chromium: a click on a landing's door, a station or a
  line opens its page without loading a new document, the rail's brand
  leads back to the landing, Back returns to the index, and every page
  hydrates without a console error. It launches
  the Chromium Playwright installed (`bunx playwright install chromium`), or
  the binary named by `E2E_CHROMIUM_EXECUTABLE_PATH`.

## The schema

`src/relay/schema.graphql` is the metro provider's schema: the Prism data
contract followed by the provider's extension, with the extension's root
fields (`prose`, `search`) moved into `type Query`: relay-compiler reads a
field under `extend type Query` as a client extension and never sends it to
the server. It is written by `bun run schema` and checked by
`bun run check`, so after the provider changes, rerun `bun run schema` and
commit the result.

## Route names

The lens packages link by route name, so the site's route table and its
`RouterRegister` carry these names:

| Name              | URL                  |
| ----------------- | -------------------- |
| `home`            | `/`                  |
| `stations`        | `/stations`          |
| `stationsEntity`  | `/stations/:uri`     |
| `lines`           | `/lines`             |
| `linesEntity`     | `/lines/:uri`        |
| `definitions`     | `/definitions`       |
| `definitionsTerm` | `/definitions/:term` |

An entity or a term is addressed by its compact address, percent-encoded:
`/stations/metro%3Anorthgate`, `/definitions/metro%3AStation`.
