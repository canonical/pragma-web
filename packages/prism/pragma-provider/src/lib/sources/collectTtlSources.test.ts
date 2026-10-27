// =============================================================================
// The collector, against the hermetic corpus.
//
// Every property here was previously untestable: the app's `collectTtlSources`
// read `$PRAGMA_REFS_DIR` internally, so exercising it meant having a populated
// pragma refs cache — which no CI leg and no fresh clone has. Roots are now an
// argument and the corpus is checked in, so these are ordinary unit tests.
//
// 🔴 NOTHING IN THIS FILE WRITES. `collectTtlSources` reads; the SDL write
// lives behind `createPragmaProvider`'s optional `sdlOutput`, which nothing
// here passes. Pointing a root at a real ontology tree is safe here for
// exactly that reason. The claim is about THIS file, not about the package:
// `createPragmaProvider.test.ts` does pass `sdlOutput`, to a temporary
// directory it then removes, which is how the write is proved at all — see
// `createPragmaProvider.ts`'s header.
// =============================================================================

import { describe, expect, it, vi } from "vitest";
import {
  CORPUS_EMPTY_REFS_ROOT,
  CORPUS_REFS_ROOT,
  CORPUS_SEM_ROOT,
  CORPUS_WRONG_SEM_ROOT,
  MISSING_ROOT,
} from "../../testing/corpus.js";
import {
  DEFAULT_SEM_ROOT,
  REF_PACKAGES,
  SEM_PACKAGES,
} from "../config/index.js";
import {
  collectTtlSources,
  escapeChannelDottedRefs,
  resolveSemRoot,
} from "./collectTtlSources.js";
import { cacheRefRoots } from "./resolveRefRoots.js";

/** The corpus's ref packages, in the refs-cache layout the corpus mirrors. */
const corpusRefRoots = cacheRefRoots(CORPUS_REFS_ROOT);
const bothRoots = { refRoots: corpusRefRoots, semRoot: CORPUS_SEM_ROOT };

describe("the ordering precondition", () => {
  it("keeps REF_PACKAGES and SEM_PACKAGES disjoint", () => {
    // `byPath` has no equal arm, and its comment licenses that by asserting
    // collected paths are unique — which rests on these two lists sharing no
    // member. Nothing enforced it; a duplicate was one edit away from making a
    // documented precondition quietly false.
    expect(REF_PACKAGES.filter((pkg) => SEM_PACKAGES.includes(pkg))).toEqual(
      [],
    );
  });
});

describe("collectTtlSources over both roots", () => {
  const paths = collectTtlSources(bothRoots).map((source) => source.path);

  it("collects both roots into one ordered set", () => {
    // The whole list, pinned. A new corpus file that nothing asserts on is a
    // fixture nobody is reading; this makes adding one a deliberate act.
    expect(paths).toStrictEqual([
      "anatomy-dsl/definitions/anatomy.ttl",
      "design-system/data/instances.ttl",
      "design-system/data/search.ttl",
      "design-system/data/tokens/colors.ttl",
      "design-system/definitions/ontology.ttl",
      "surface/definitions/surface.ttl",
    ]);
  });

  it("skips dot-prefixed files", () => {
    // `.channel.ttl` is an experimental-channel artifact, not a graph source.
    expect(paths.some((path) => path.includes(".channel"))).toBe(false);
    expect(
      collectTtlSources(bothRoots).some((source) =>
        source.content.includes("ds:leaked"),
      ),
    ).toBe(false);
  });

  it("skips files that are not .ttl", () => {
    expect(paths.some((path) => path.endsWith(".md"))).toBe(false);
  });

  it("descends into nested directories", () => {
    expect(paths).toContain("design-system/data/tokens/colors.ttl");
  });

  it("drops EXCLUDED_SOURCES by its store-visible path", () => {
    // The file is on disk under the sem root; the constant names it; the
    // collected set must not carry it. This is the shim-concept exclusion —
    // `ds:embodiesConcept rdfs:domain ds:Entity` would smear two fields onto
    // every subclass of `ds:Entity` the moment both roots compile together.
    expect(paths).not.toContain("design-system-docs/data/shim-concept.ttl");
    expect(
      collectTtlSources(bothRoots).some((source) =>
        source.content.includes("embodiesConcept"),
      ),
    ).toBe(false);
  });

  it("tolerates a ref package that is not in the cache", () => {
    // `code-standards` is in REF_PACKAGES and absent from the corpus — the
    // state a partially-populated cache is actually in. It contributes
    // nothing and throws nothing.
    expect(paths.some((path) => path.startsWith("code-standards/"))).toBe(
      false,
    );
  });

  it("escapes channel-dotted references in the content it hands the store", () => {
    const instances = collectTtlSources(bothRoots).find(
      (source) => source.path === "design-system/data/instances.ttl",
    );
    expect(instances?.content).toContain("ds:\\.subcomponent.button-label");
  });
});

describe("collectTtlSources without the semantics tree", () => {
  const paths = collectTtlSources({
    refRoots: corpusRefRoots,
    semRoot: MISSING_ROOT,
  }).map((source) => source.path);

  it("skips the second root entirely rather than failing", () => {
    // The four shipped lenses read the first root only, so an absent
    // semantics tree must degrade, not break.
    expect(paths).not.toContain("surface/definitions/surface.ttl");
  });

  it("still collects the first root", () => {
    expect(paths).toStrictEqual([
      "anatomy-dsl/definitions/anatomy.ttl",
      "design-system/data/instances.ttl",
      "design-system/data/search.ttl",
      "design-system/data/tokens/colors.ttl",
      "design-system/definitions/ontology.ttl",
    ]);
  });
});

describe("collectTtlSources with a semantics tree that is there but wrong", () => {
  // The case an existence check on the root cannot see: the directory is
  // present, so the missing-tree warning never fires, and neither expected
  // package is under it — `walkTtl` contributes nothing and the boot log would
  // otherwise report a healthy compile of a half-empty schema.
  const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
  const paths = collectTtlSources({
    refRoots: corpusRefRoots,
    semRoot: CORPUS_WRONG_SEM_ROOT,
  }).map((source) => source.path);
  const warnings = warn.mock.calls.map((call) => String(call[0]));
  warn.mockRestore();

  it("warns once per package that contributed nothing", () => {
    expect(warnings).toHaveLength(SEM_PACKAGES.length);
    for (const pkg of SEM_PACKAGES) {
      expect(warnings.join("\n")).toContain(`"${pkg}" contributed no .ttl`);
    }
  });

  it("does not repeat the missing-tree warning: the tree is not missing", () => {
    expect(warnings.join("\n")).not.toContain("semantics tree not found");
  });

  it("still collects the first root", () => {
    expect(paths).toStrictEqual([
      "anatomy-dsl/definitions/anatomy.ttl",
      "design-system/data/instances.ttl",
      "design-system/data/search.ttl",
      "design-system/data/tokens/colors.ttl",
      "design-system/definitions/ontology.ttl",
    ]);
  });
});

describe("collectTtlSources with the semantics tree skipped on purpose", () => {
  const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
  const paths = collectTtlSources({
    refRoots: corpusRefRoots,
    semRoot: null,
  }).map((source) => source.path);
  const warnings = warn.mock.calls.map((call) => String(call[0]));
  warn.mockRestore();

  it("collects the first root only", () => {
    expect(paths).toStrictEqual([
      "anatomy-dsl/definitions/anatomy.ttl",
      "design-system/data/instances.ttl",
      "design-system/data/search.ttl",
      "design-system/data/tokens/colors.ttl",
      "design-system/definitions/ontology.ttl",
    ]);
  });

  it("announces nothing: an explicit null is not a missing tree", () => {
    // The docsite's schema generator asks for exactly this on every machine,
    // and a warning on every run would train everyone to ignore the one that
    // matters.
    expect(warnings).toEqual([]);
  });
});

describe("collectTtlSources when the roots hold nothing", () => {
  it("throws an actionable message when no root contributes a source", () => {
    // The cache root exists and is empty: "there but you have not run the
    // update". The missing-root case is the resolver's to report, in
    // `resolveRefRoots.test.ts`, before the collector is ever reached.
    expect(() =>
      collectTtlSources({
        refRoots: cacheRefRoots(CORPUS_EMPTY_REFS_ROOT),
        semRoot: CORPUS_SEM_ROOT,
      }),
    ).toThrow(/no \.ttl sources found under /);
  });
});

describe("escapeChannelDottedRefs", () => {
  it("escapes a dot-leading local name", () => {
    expect(escapeChannelDottedRefs("ex:.foo")).toBe("ex:\\.foo");
  });

  it("leaves an ordinary prefixed name alone", () => {
    expect(escapeChannelDottedRefs("ex:foo.bar")).toBe("ex:foo.bar");
  });

  it("leaves a dot that begins no local name alone", () => {
    // The trailing statement dot, and a dot followed by a non-name character.
    expect(escapeChannelDottedRefs("ex:foo .\nex:.9bad")).toBe(
      "ex:foo .\nex:.9bad",
    );
  });

  it("leaves the spelling inside a string literal untouched", () => {
    // Raised in review. A backslash here would be a parse ERROR, not a
    // harmless edit: `\\.` is not one of Turtle's string escapes, so a source
    // whose prose merely mentions the spelling would stop parsing.
    expect(escapeChannelDottedRefs('ex:a rdfs:comment "see ex:.foo" .')).toBe(
      'ex:a rdfs:comment "see ex:.foo" .',
    );
  });

  it("leaves the spelling inside an IRI reference untouched", () => {
    // A backslash is not legal anywhere in an IRIREF.
    expect(escapeChannelDottedRefs("<https://e.example/ex:.foo>")).toBe(
      "<https://e.example/ex:.foo>",
    );
  });

  it("leaves the spelling inside a comment untouched", () => {
    expect(escapeChannelDottedRefs("# ex:.foo\nex:.foo")).toBe(
      "# ex:.foo\nex:\\.foo",
    );
  });
});

describe("semantics root resolution", () => {
  it("prefers PRAGMA_SEM_DIR over the working-tree default", () => {
    vi.stubEnv("PRAGMA_SEM_DIR", CORPUS_SEM_ROOT);
    expect(resolveSemRoot()).toBe(CORPUS_SEM_ROOT);
    vi.unstubAllEnvs();
  });

  it("falls back to the sibling semantics working tree", () => {
    vi.stubEnv("PRAGMA_SEM_DIR", undefined);
    expect(resolveSemRoot()).toBe(DEFAULT_SEM_ROOT);
    vi.unstubAllEnvs();
  });
});
