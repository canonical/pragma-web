// =============================================================================
// The boot, against the hermetic corpus — including the anatomy collision.
//
// -----------------------------------------------------------------------------
// 🔬 THE MEASUREMENT THIS FILE EXISTS FOR.
//
// `anatomy:uri` maps to the GraphQL field name `uri`, which the converged base
// reserves as the primary key the compiler injects on every Node implementer.
// Unresolved, that is `M005`, severity `error`, and `runPasses`' fatality gate
// refuses to hand out the schema: the boot dies. The anatomy DSL resolves it in
// the ontology itself, with `graphql:name "anatomyUri"` on the term
// (`@canonical/anatomy-dsl` 0.43.0), and the corpus carries the same annotation.
//
// This package used to carry the rename as a `CUSTOM_MAPPINGS` constant, from
// before the annotation existed upstream. Once it did, the constant referenced
// nothing on the real graph (`M003`) and was deleted. What this file measures
// is therefore no longer a constant of this package but a property of the
// ontology plus the compiler, and it is measured both ways rather than read
// from a document: the annotated corpus boots with `anatomyUri: String` on
// `NamedNode` and `uri: ID!` untouched; the same corpus with the annotation
// stripped from the source text throws `CompilationError` carrying `M005`. If
// a future ke-graphql stopped binding `graphql:name`, or downgraded M005 to a
// warning, this file goes red — which is the correct outcome, because the
// app's committed `schema.graphql` would then quietly lose a field instead of
// refusing to build.
//
// -----------------------------------------------------------------------------
// 🔴 THE DEFAULT IS NO WRITE, AND EXACTLY ONE TEST DEPARTS FROM IT. Omitting
// `sdlOutput` writes nothing, with no default path to fall back to — a
// property of the option's shape rather than of this file's discipline, and
// what makes every other test here safe to run against any root. The one
// exception is the `sdlOutput` test below, which passes a freshly created
// temporary destination, asserts the file was written, and removes the
// directory afterwards: the write is proved somewhere isolated rather than
// left as an untested claim. See `createPragmaProvider.ts`'s header.
// =============================================================================

import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { createStore, type Plugin } from "@canonical/ke";
import { createSchemaPlugin } from "@canonical/ke-graphql";
import { satisfiesContract } from "@canonical/prism-contract";
import { describe, expect, it, vi } from "vitest";
import { CORPUS_REFS_ROOT, MISSING_ROOT } from "../../testing/corpus.js";
import {
  cacheRefRoots,
  collectTtlSources,
  harvestPrefixes,
} from "../sources/index.js";
import { createPragmaProvider } from "./createPragmaProvider.js";

/** One boot, shared: Oxigraph is a WASM store and booting it is not free. */
const booted = createPragmaProvider({ refsRoot: CORPUS_REFS_ROOT });

describe("createPragmaProvider over the ref packages", () => {
  it("compiles a schema from every ref package into one store", async () => {
    const { api } = await booted;
    expect(api.sdl).toContain("type Component");
    // `Job` comes only from the `surface` package, a ref package like the
    // others: proof the demand model compiles into the same store.
    expect(api.sdl).toContain("type Job");
  });

  it("satisfies the documentation site's contract as emitted, not as committed", async () => {
    // The committed schema's own gate cannot see the compiler drift away from
    // the contract until someone regenerates it; this reads the live emission
    // of the ke-graphql this package pins, so a bump that breaks conformance
    // is red on the bump itself.
    const { api } = await booted;
    expect(satisfiesContract(api.sdl).violations).toEqual([]);
  });

  it("parses the channel-dotted reference rather than choking on it", async () => {
    // Unescaped, `ds:.subcomponent.button-label` is invalid Turtle and the
    // store would refuse the whole file. A successful boot IS the assertion;
    // the dangling target reads as honest absence.
    const { api } = await booted;
    expect(api.schema).toBeDefined();
  });

  it("serves the compiled schema over the fetch handler", async () => {
    const { handle } = await booted;
    const response = await handle(
      new Request("http://localhost/graphql", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ query: "{ __schema { queryType { name } } }" }),
      }),
    );
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({
      data: { __schema: { queryType: { name: "Query" } } },
    });
  });
});

describe("the anatomy:uri collision", () => {
  it("honours the ontology's graphql:name annotation", async () => {
    const { api } = await booted;
    // Not merely "some field survived": the annotation's whole point is that
    // it produces the EXACT name the committed schema carries, so nothing
    // downstream moves.
    expect(api.sdl).toContain("anatomyUri: String");
  });

  it("has NOT quietly renamed the reserved field", async () => {
    const { api } = await booted;
    // `uri: ID!` is the compiler-injected primary key. If `anatomy:uri` ever
    // took it, this is what would change: the field would move off NamedNode
    // and the compiler's own `uri` would be the casualty.
    expect(api.sdl).toContain("type NamedNode implements Node");
    const namedNode = /type NamedNode implements Node[^{]*\{([^}]*)\}/.exec(
      api.sdl,
    )?.[1];
    expect(namedNode, "NamedNode block").toBeDefined();
    expect(namedNode).toContain("anatomyUri: String");
    expect(namedNode).toContain("uri: ID!");
  });
});

describe("the pinned compiler options", () => {
  // `mode` and `prefixing` are passed explicitly rather than left to
  // ke-graphql's defaults, and the module header says why: `prefixing: "all"`
  // would namespace-prefix EVERY generated field and invalidate every
  // committed Relay artifact at once. That claim was prose and nothing else —
  // flipping the constant left the whole suite green. These assertions are the
  // teeth: they read the emitted names, so the edit that the header calls
  // catastrophic now fails here rather than in the app.

  it('emits unprefixed field names — the "none" half of the pin', async () => {
    const { api } = await booted;
    expect(api.sdl).toContain("jobLabel");
    expect(api.sdl).toContain("tier");
  });

  it('carries none of the names `prefixing: "all"` would produce', async () => {
    // The blanket M005 remedy renames `sur:jobLabel` to `surJobLabel` and
    // `ds:tier` to `dsTier`. Their absence is what makes the committed
    // schema.graphql byte-compatible with this emission.
    const { api } = await booted;
    expect(api.sdl).not.toContain("surJobLabel");
    expect(api.sdl).not.toContain("dsTier");
  });

  it("reports exactly the diagnostics the boot is expected to raise", async () => {
    // The module header records this as an OBSERVATION — "one diagnostic,
    // V014, severity info". It was never asserted, so the observation could
    // rot. It is asserted now.
    const { api } = await booted;
    expect(
      api.diagnostics.map(
        (diagnostic) => `${diagnostic.code}:${diagnostic.severity}`,
      ),
    ).toEqual(["V014:info"]);
  });

  it("KILLS THE BOOT when the annotation is stripped — observed, not assumed", async () => {
    // THE NEGATIVE HALF, run for real.
    //
    // The annotation lives in the ontology, so the negative case is the same
    // corpus with that one line removed from the source TEXT, handed to
    // ke-graphql one layer down through the package's own collector and
    // prefix harvester. Everything else is held identical to
    // `createPragmaProvider`: same sources, same prefixes, same
    // `mode`/`prefixing`/`incremental`. The only difference is the annotation.
    const ANNOTATION = /^\s*graphql:name "anatomyUri" ;\n/m;
    const sources = collectTtlSources(cacheRefRoots(CORPUS_REFS_ROOT)).map(
      (source) =>
        source.path.endsWith("anatomy.ttl")
          ? { ...source, content: source.content.replace(ANNOTATION, "") }
          : source,
    );
    expect(sources.some((source) => ANNOTATION.test(source.content))).toBe(
      false,
    );
    const unannotated = createSchemaPlugin({
      incremental: true,
      mode: "annotated",
      prefixing: "none",
    });
    const thrown = await createStore({
      sources: sources.map(({ content, path }) => ({ content, path })),
      prefixes: harvestPrefixes(sources),
      // biome-ignore lint: Plugin generic variance requires explicit unknown
      plugins: [unannotated] as Plugin<any>[],
    }).then(
      () => undefined,
      (error: unknown) => error,
    );

    // It throws. It does not return a schema minus the field.
    expect(thrown).toBeInstanceOf(Error);
    expect((thrown as Error).message).toContain("compilation failed");
    expect((thrown as Error).message).toContain("M005");
    expect((thrown as Error).message).toContain(
      "http://anatomy-dsl.example.org/ontology#uri",
    );
    expect((thrown as Error).message).toContain(
      "a structural field the compiler owns — the field is DROPPED",
    );
  });
});

describe("prose sidecars", () => {
  it("announces a sidecar that names no entity, and binds the rest", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const info = vi.spyOn(console, "info").mockImplementation(() => {});
    await createPragmaProvider({ refsRoot: CORPUS_REFS_ROOT });
    const warnings = warn.mock.calls.map((call) => String(call.at(0)));
    const infos = info.mock.calls.map((call) => String(call.at(0)));
    warn.mockRestore();
    info.mockRestore();
    expect(warnings.filter((line) => line.includes("prose sidecar"))).toEqual([
      expect.stringContaining(
        "prose sidecar design-system/definitions/NOTES.md names no entity in the graph",
      ),
    ]);
    expect(infos.join("\n")).toContain("2 prose sidecars bound");
  });
});

describe("search index", () => {
  it("indexes every node node(id:) resolves at boot, and says how many", async () => {
    const info = vi.spyOn(console, "info").mockImplementation(() => {});
    await createPragmaProvider({ refsRoot: CORPUS_REFS_ROOT });
    const infos = info.mock.calls.map((call) => String(call.at(0)));
    info.mockRestore();
    // Five components, three classes from the design system and `sur:Job`
    // from the surface ontology; the properties the graph types are left
    // out.
    expect(infos.join("\n")).toContain(
      "2 prose sidecars bound, 9 nodes indexed for search",
    );
  });
});

describe("sdlOutput", () => {
  it("writes nothing and says so when it is absent", async () => {
    const info = vi.spyOn(console, "info").mockImplementation(() => {});
    await createPragmaProvider({ refsRoot: CORPUS_REFS_ROOT });
    expect(info).toHaveBeenCalledWith(
      expect.stringContaining("SDL output disabled (no sdlOutput given)"),
    );
    info.mockRestore();
  });

  it("writes exactly where the CALLER said, and nowhere else", async () => {
    // 🔴 The destination is a scratch directory outside the repository, on
    // purpose. This package must never write into a tracked source tree —
    // not from its demo, not from its tests. The whole reason `sdlOutput` is
    // an argument with no default is that the path is the caller's to own,
    // and a test that proved the write by scribbling on
    // `apps/react/pragma-docs/src/relay/schema.graphql` would be proving the
    // opposite of the property.
    const destination = join(
      mkdtempSync(join(tmpdir(), "prism-pragma-provider-")),
      "schema.graphql",
    );
    const info = vi.spyOn(console, "info").mockImplementation(() => {});
    await createPragmaProvider({
      refsRoot: CORPUS_REFS_ROOT,
      sdlOutput: destination,
    });
    info.mockRestore();

    expect(existsSync(destination)).toBe(true);
    const written = readFileSync(destination, "utf-8");
    expect(written).toContain("type Component");
    expect(written).toContain("anatomyUri: String");
    rmSync(dirname(destination), { recursive: true, force: true });
  });
});

describe("createPragmaProvider without roots", () => {
  it("resolves the refs root from the environment and fails actionably", async () => {
    // Called with NO options at all, so the default resolves. In any
    // environment without a populated pragma cache this is the message a
    // developer sees, and it must name the remedy.
    vi.stubEnv("PRAGMA_REFS_DIR", MISSING_ROOT);
    await expect(createPragmaProvider()).rejects.toThrow(
      /pragma refs cache not found at .*— run `pragma sources update`/,
    );
    vi.unstubAllEnvs();
  });
});
