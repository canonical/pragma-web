# The hermetic corpus

A hand-written Turtle corpus laid out in the exact shape `collectTtlSources`
walks, so every property of the collector and the boot is falsifiable **without
a populated refs cache**.

This is what makes the package testable at all. Pragma's real corpus is the
pragma CLI's refs cache (`~/.cache/pragma/refs/@canonical`, three packages,
~400 `.ttl`), or the same packages installed in `node_modules`, plus the demand
model's shims. A suite over them would test pragma's modelling rather than this
package, and would move whenever an ontology is released. Precedent:
[`demo/graph.ttl`](https://github.com/canonical/pragma-core/blob/main/packages/engine/ke-graphql/demo/graph.ttl) in `@canonical/ke-graphql` is exactly this, and that package
holds 551 tests at 100%.

## What each file is for

| Path | Property it makes falsifiable |
|---|---|
| `refs/@canonical/design-system/main/definitions/ontology.ttl` | the ref packages compile; `ds:Entity` roots the class tree |
| `refs/@canonical/design-system/main/data/instances.ttl` | instance data merges into the same store; carries a **channel-dotted reference** (`ds:.subcomponent.button-label`) that only parses because `escapeChannelDottedRefs` rewrites it |
| `refs/@canonical/design-system/main/data/button.md` | a **prose sidecar** binds by its name to `ds:button`, the entity `instances.ttl` beside it declares. Its links make reference resolution falsifiable: an inline CURIE to an entity (`ds:button`), a reference-style link to a class (`ds:Component`), a link inside a code span that must not count (`ds:Entity`), and an external link that resolves to nothing |
| `refs/@canonical/design-system/main/data/button.fr.md` | the **French text** of the same entity: `.fr` reads as a language tag, so it binds to `ds:button` too and adds `fr` to its available languages |
| `refs/@canonical/design-system/main/data/search.ttl` | **labelled instances make search ranking falsifiable**: title against CURIE against definition, an earlier match against a later one, a shorter title against a longer one. It declares only `ds:` and writes `rdfs:label` and `skos:definition` as full IRIs, so the harvested prefixes, the SDL and the diagnostics stay what they were |
| `refs/@canonical/design-system/main/data/.channel.ttl` | **dot-prefixed files are skipped.** Its one triple would add a `ds:Component` named `leaked`; nothing in the collected set ever mentions it |
| `refs/@canonical/anatomy-dsl/main/definitions/anatomy.ttl` | declares an `anatomy:uri` property, which collides with the compiler's own `uri` key (M005), **and** the `graphql:name "anatomyUri"` annotation the real anatomy DSL resolves it with. The boot test proves the annotation is honoured and that stripping it is fatal |
| `refs/@canonical/design-system/main/definitions/NOTES.md` | a Markdown note beside Turtle that names no entity. The Turtle collector skips it by extension; the sidecar collector finds it, it binds to nothing, and the boot announces it rather than dropping it silently |
| `refs/@canonical/surface/main/definitions/surface.ttl` | the demand model's ontology compiles as a ref package like the others: `sem://surface#Job` yields a `Job` type no other package declares |
| `refs/@canonical/design-system-docs/main/data/jobs.ttl` | the demand model's data merges like any instance data; with `surface`, it is what lets the corpus pass as a refs cache at all, since a cache without the demand model is refused |

`code-standards` is listed in `REF_PACKAGES` but **deliberately absent from the
corpus**: that is what exercises `walkFiles`'s "directory does not exist"
return, which is the state a partially-populated refs cache is actually in.

## What this corpus is not

It is **not** a copy of pragma's ontologies. The IRIs are `example.org` stand-ins
throughout; only the `graphql:` annotation vocabulary is the real one, because
that is what the compiler binds. Vendoring the real ontologies into this repo
would be a licensing and staleness problem for no test value: the properties
under test are about the collector and the compiler, not about pragma's
modelling.
