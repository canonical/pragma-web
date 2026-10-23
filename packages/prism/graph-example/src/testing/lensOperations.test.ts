import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { readLensTier } from "./lensOperations.js";

/** A source file declaring one lens facet over the given object text. */
const writeLensSource = (path: string, facet: string): void => {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(
    path,
    `export const meta = { ...routeLensFacet.of(${facet}) };\n`,
    "utf8",
  );
};

describe("lensOperations", () => {
  let root: string;

  beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), "lens-tier-"));
  });

  afterEach(() => {
    rmSync(root, { recursive: true, force: true });
  });

  describe("readLensTier", () => {
    it("returns undefined for a directory that does not exist", () => {
      expect(readLensTier(join(root, "missing"))).toBeUndefined();
    });

    it("returns undefined for a root that declares no lens", () => {
      writeFileSync(join(root, "index.ts"), "export const a = 1;\n", "utf8");

      expect(readLensTier(root)).toBeUndefined();
    });

    it("reads a literal tier 1", () => {
      writeLensSource(
        join(root, "routes.ts"),
        '{ label: "Guides", order: 6, tier: 1 }',
      );

      expect(readLensTier(root)).toBe(1);
    });

    it("reads a literal tier 2 from a nested directory", () => {
      writeLensSource(
        join(root, "lib", "routes.tsx"),
        '{ label: "Standards", order: 4, tier: 2 }',
      );

      expect(readLensTier(root)).toBe(2);
    });

    it("reads the tier of a facet whose object nests braces", () => {
      writeLensSource(
        join(root, "routes.ts"),
        // biome-ignore lint/suspicious/noTemplateCurlyInString: the facet text holds a template literal on purpose
        "{ label: `Lens ${name}`, icon: { size: 16 }, order: 4, tier: 2 }",
      );

      expect(readLensTier(root)).toBe(2);
    });

    it("agrees when several lenses under one root declare the same tier", () => {
      writeLensSource(join(root, "a.ts"), '{ label: "A", order: 1, tier: 1 }');
      writeLensSource(join(root, "b.ts"), '{ label: "B", order: 2, tier: 1 }');

      expect(readLensTier(root)).toBe(1);
    });

    it("skips the lens facets declared in test files", () => {
      writeLensSource(join(root, "routes.ts"), '{ label: "A", tier: 1 }');
      writeLensSource(join(root, "routes.test.tsx"), '{ label: "B", tier: 2 }');
      writeLensSource(join(root, "routes.tests.ts"), '{ label: "C", tier: 2 }');

      expect(readLensTier(root)).toBe(1);
    });

    it("skips the relay-compiler artifacts", () => {
      writeLensSource(join(root, "routes.ts"), '{ label: "A", tier: 1 }');
      writeLensSource(
        join(root, "__generated__", "Artifact.graphql.ts"),
        '{ label: "B", tier: 2 }',
      );

      expect(readLensTier(root)).toBe(1);
    });

    it("throws for a facet whose tier is not a literal", () => {
      writeLensSource(join(root, "routes.ts"), '{ label: "A", tier: TIER }');

      expect(() => readLensTier(root)).toThrow(/declares no literal tier/);
    });

    it("throws for a facet that declares no tier", () => {
      writeLensSource(join(root, "routes.ts"), '{ label: "A", order: 1 }');

      expect(() => readLensTier(root)).toThrow(/declares no literal tier/);
    });

    it("throws for a facet whose object never closes", () => {
      writeFileSync(
        join(root, "routes.ts"),
        "routeLensFacet.of({ label: { tier: 1 }",
        "utf8",
      );

      expect(() => readLensTier(root)).toThrow(/declares no literal tier/);
    });

    it("throws when the lenses under one root declare different tiers", () => {
      writeLensSource(join(root, "a.ts"), '{ label: "A", tier: 1 }');
      writeLensSource(join(root, "b.ts"), '{ label: "B", tier: 2 }');

      expect(() => readLensTier(root)).toThrow(/more than one tier/);
    });
  });
});
