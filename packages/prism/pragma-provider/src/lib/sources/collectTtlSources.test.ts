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

import { describe, expect, it } from "vitest";
import {
  CORPUS_EMPTY_REFS_ROOT,
  CORPUS_REFS_ROOT,
} from "../../testing/corpus.js";
import { REF_PACKAGES } from "../config/index.js";
import {
  collectTtlSources,
  escapeChannelDottedRefs,
} from "./collectTtlSources.js";
import { cacheRefRoots } from "./resolveRefRoots.js";

/** The corpus's ref packages, in the refs-cache layout the corpus mirrors. */
const corpusRefRoots = cacheRefRoots(CORPUS_REFS_ROOT);

describe("the ordering precondition", () => {
  it("REF_PACKAGES names each package once", () => {
    // `compareByPath` has no equal arm, and its comment licenses that by
    // asserting collected paths are unique — which rests on no package being
    // walked twice under the same label. A duplicate was one edit away from
    // making a documented precondition quietly false.
    expect(new Set(REF_PACKAGES).size).toBe(REF_PACKAGES.length);
  });
});

describe("collectTtlSources over the ref packages", () => {
  const paths = collectTtlSources(corpusRefRoots).map((source) => source.path);

  it("collects every ref package into one ordered set", () => {
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
      collectTtlSources(corpusRefRoots).some((source) =>
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

  it("tolerates a ref package that is not in the cache", () => {
    // `code-standards` and `design-system-docs` are in REF_PACKAGES and
    // absent from the corpus — the state a partially-populated cache is
    // actually in. They contribute nothing and throw nothing.
    expect(
      paths.some(
        (path) =>
          path.startsWith("code-standards/") ||
          path.startsWith("design-system-docs/"),
      ),
    ).toBe(false);
  });

  it("escapes channel-dotted references in the content it hands the store", () => {
    const instances = collectTtlSources(corpusRefRoots).find(
      (source) => source.path === "design-system/data/instances.ttl",
    );
    expect(instances?.content).toContain("ds:\\.subcomponent.button-label");
  });
});

describe("collectTtlSources when the roots hold nothing", () => {
  it("throws an actionable message when no root contributes a source", () => {
    // The cache root exists and is empty: "there but you have not run the
    // update". The missing-root case is the resolver's to report, in
    // `resolveRefRoots.test.ts`, before the collector is ever reached.
    expect(() =>
      collectTtlSources(cacheRefRoots(CORPUS_EMPTY_REFS_ROOT)),
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
