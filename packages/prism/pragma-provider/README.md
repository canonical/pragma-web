# @canonical/prism-pragma-provider

**The pragma provider for the Prism docsite contract.** It reads pragma's Turtle
corpus, compiles it with
[`@canonical/ke-graphql`](https://github.com/canonical/pragma-core/tree/main/packages/engine/ke-graphql) into an
executable GraphQL schema, and serves it as a fetch-native handler.

It exists because the docsite app should not. Until this package landed,
`apps/react/pragma-docs/src/server/graphql.ts` held the ref-package list, the semantic
package list, an ontology exclusion, a custom field mapping (since deleted), and the compiler options —
296 lines of knowledge about *pragma's specific ontologies* living inside an application
that claims to render against any conformant provider. After this package, the app
imports one factory and depends on **no knowledge engine at all**: no `@canonical/ke`,
no `@canonical/ke-graphql`.

> **Deliberately not published.** `"private": true`, matching
> `prism-graph-example`. Its only consumer is this repository.

---

## Why it *does* use ke-graphql

This is the exact inverse of `prism-graph-example`, and the
inversion is the point.

graph-example is hand-written **because** it must not use ke-graphql: one compiler
satisfying the contract twice measures the compiler, not the contract. That package is
the control.

This package is the subject. It is what the docsite actually runs on, and ke-graphql
*is* the thing under test here — whether the compiler, pointed at real ontologies with
real modelling accidents in them, emits a schema that satisfies the same contract a
hand-written provider does. Two providers, two engines, one contract. Neither package
proves anything without the other.

---

## The four pieces of relocated pragma knowledge

Each of these is a fact about a specific upstream ontology, and each has a fix that
would delete it from this repo. They are pinned constants
(`src/lib/config/constants.ts`), not options — see that file's header for why.

| Constant | What it encodes | The upstream fix that deletes it |
|---|---|---|
| `REF_PACKAGES` | `design-system`, `code-standards`, `anatomy-dsl` — the source packages, declared as dependencies at exact versions and read from `node_modules` | A manifest the packages publish themselves, so the list is read rather than hard-coded |
| `SEM_PACKAGES` | `surface`, `design-system-docs` — the docsite's own demand model, in a second root | Publishing the demand model as a ref package, collapsing two roots to one |
| `EXCLUDED_SOURCES` | drops `design-system-docs/data/shim-concept.ttl`, whose `ds:embodiesConcept rdfs:domain ds:Entity` smears two fields onto all fourteen `ds:` types | A modelling fix: narrow the domain off the class-tree root |

### The anatomy collision: resolved upstream, still measured here

A fourth constant used to sit in that table: `CUSTOM_MAPPINGS`, renaming `anatomy:uri`
to `anatomyUri` because `uri` is the primary key the compiler injects on every Node, and
an ontology property of the same name is an `M005` error that kills the boot. Its
documented upstream fix was a `graphql:name "anatomyUri"` annotation on the term in the
anatomy DSL itself. `@canonical/anatomy-dsl` 0.43.0 carries that annotation, so the
constant did nothing on the real graph (the compiler reported `M003`, a mapping that
references nothing) and it was deleted.

What stays is the measurement. The hermetic corpus carries the same annotation, and
`src/lib/provider/createPragmaProvider.test.ts` asserts both halves on every run: with the
annotation the SDL carries `anatomyUri: String` on `NamedNode` and the compiler's own
`uri: ID!` is untouched; with the annotation stripped from the source text the boot
throws `CompilationError` carrying `M005 … the field is DROPPED`. If a future ke-graphql
stopped binding `graphql:name`, or downgraded M005 to a warning, this file goes red,
which is the right outcome: the committed schema would otherwise quietly lose a field.

---

## `mode` and `prefixing` are pinned, not defaulted

The app set neither, so it ran at ke-graphql's defaults *by accident*. This package
passes both explicitly:

```ts
mode: "annotated"   // heuristic baseline plus the graphql: annotation overlay
prefixing: "none"   // field names are the mapped OWL local names
```

`prefixing: "none"` is what makes the emitted names byte-compatible with the committed
`apps/react/pragma-docs/src/relay/schema.graphql` that relay-compiler reads.
`prefixing: "all"` — the blanket M005 remedy — would namespace-prefix **every** field in
the schema to clear one collision, invalidating every committed Relay artifact at once.
An implicit default that a dependency bump could change is exactly the kind of unstated
fact this package exists to write down.

---

## The SDL output path belongs to the caller

`PragmaProviderOptions.sdlOutput` is optional and **absent means no write**. This
package never derives a path.

The app's former `graphql.ts` derived one from `import.meta.url`. Carried into a package
unchanged, that resolves relative to the *package* — so the app's schema would be
written into `node_modules`, and `tsc`, `biome` and every test in the repo would still
pass. Only a boot reveals it. The guard is therefore
structural: there is no path in this package to get wrong.

---

## Testing: the hermetic corpus

Pragma's real corpus is the three ref packages plus a semantics working tree. The
packages are installed, so a boot over them is possible in CI, but it is a three-second
boot over several hundred files and it proves pragma's ontologies rather than this
package's logic; the semantics tree does not exist in CI at all. The unit suite therefore
runs against a corpus of its own, and only `resolveRefRoots.test.ts` touches the real
install, read-only, to prove the default resolution finds it.

`src/testing/__fixtures__/corpus/` is a hand-written Turtle corpus in the exact shape the
collector walks, small enough to read in one sitting and complete enough to make every
property falsifiable: two roots merging, dot-prefixed files skipped, the exclusion
dropped, channel-dotted references escaped, prefixes harvested, both actionable failure
messages, and the anatomy collision in both directions. See that directory's README for
what each file is for. Precedent: [`demo/graph.ttl`](https://github.com/canonical/pragma-core/blob/main/packages/engine/ke-graphql/demo/graph.ttl)
in `@canonical/ke-graphql`.

### The two SDL captures are stale, and it is written down

`src/testing/__fixtures__/*.sdl.txt` back `src/testing/integration/sourceAdditivity.test.ts` (ported
unchanged from the app). Measured at `4d228c8` against `@canonical/prism-contract`:
**12 violations each, identical set**. They predate the converged base.

They are kept because the property that suite asserts — additivity of the second source
root — is a property of the **source set**, orthogonal to the structural head, and both
sides of the comparison are equally stale. The type inventory has not drifted: the
merged capture carries 183 top-level definitions, exactly the live schema's count. They
cannot be regenerated without the semantics tree, and a capture from a *partial* corpus is
worse than a stale one because it looks current.

What that leaves open is measured only in part. `src/testing/integration/committedSdl.test.ts`
checks the schema the app **ships** — the committed `schema.graphql` — against the live
contract on every run, so the structural head those captures are stale against is not
unmeasured. Its subject is a **committed artifact**, not a live emission, so it cannot
see that file drift from what `createPragmaProvider` would emit today. Closing that
second gap is the docsite's `schema:check`, which regenerates the committed file from the installed packages and fails on a diff; the test's own header states the
same limit. What a live emission can show without one — that the compiler this package
pins still satisfies the contract — `createPragmaProvider.test.ts` checks over the
hermetic corpus.

---

## Running it

```bash
bun run serve   # GraphiQL at http://127.0.0.1:5177/graphql
```

Port 5177: the docsite's own graph holds 5175 and graph-example holds 5176, so all three
run at once and the docsite can be pointed at any of them with `VITE_GRAPHQL_URL`.

**It boots from the installed ref packages.** `@canonical/design-system`,
`@canonical/code-standards` and `@canonical/anatomy-dsl` are dependencies of this package,
pinned to exact versions, so `bun install` is the whole setup and two machines with the
same lockfile compile the same graph. The versions are stamped into the emitted SDL's
provenance header as its `revision`, so a schema diff names the release that caused it.

To work against ontology branches that are not published yet, point `PRAGMA_REFS_DIR` (or
the `refsRoot` option) at a pragma refs cache (`pragma sources update` populates one at
`~/.cache/pragma/refs/@canonical`); its `<package>/main/{definitions,data}` layout is read
instead. A cache root that does not exist is an error with the remedy in the message,
before an Oxigraph store is ever created.

**The semantics tree is optional, and can be refused.** `PRAGMA_SEM_DIR` (or `semRoot`)
names the working tree holding `surface` and `design-system-docs`; a missing one is
announced and skipped. `semRoot: null` skips it silently whatever the machine has, which
is how the docsite generates the schema it commits: from the ref packages alone, so a
local checkout cannot leak into the committed file.
