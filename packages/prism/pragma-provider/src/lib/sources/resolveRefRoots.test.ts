// =============================================================================
// Root resolution: installed packages by default, the refs cache on request.
//
// The installed-package arm is exercised against a temporary directory tree
// shaped like a Bun install (a `node_modules/@canonical/<pkg>/package.json`
// some levels above the file that starts the walk), so the test neither
// depends on this package's real `node_modules` layout nor leaves it alone
// by accident: the one real-install assertion at the end reads the actual
// dependencies, read-only, and is the proof the default works after
// `bun install`.
// =============================================================================

import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, describe, expect, it, vi } from "vitest";
import {
  CORPUS_EMPTY_REFS_ROOT,
  CORPUS_REFS_ROOT,
  MISSING_ROOT,
} from "../../testing/corpus.js";
import { REF_PACKAGES, REF_SCOPE } from "../config/index.js";
import {
  cacheRefRoots,
  describeRefRoots,
  findInstalledPackage,
  installedRefRoots,
  resolveRefRoots,
  resolveRefsRoot,
} from "./resolveRefRoots.js";

/** A fake install: every ref package present, two levels above `from`. */
const fakeInstall = mkdtempSync(join(tmpdir(), "prism-refs-"));
const fakeFrom = join(fakeInstall, "dist", "esm", "resolveRefRoots.js");
/** The one package whose manifest declares no version: a root stays unversioned. */
const UNVERSIONED = "anatomy-dsl";
/**
 * The one package whose manifest is private: it declares a version, the
 * workspace's, but names no release, so its root stays unversioned too.
 */
const PRIVATE = "surface";
/** The manifest each fake package carries. */
const fakeManifest = (pkg: string): Record<string, unknown> => {
  const name = `${REF_SCOPE}/${pkg}`;
  if (pkg === UNVERSIONED) return { name };
  if (pkg === PRIVATE) return { name, version: "9.9.9", private: true };
  return { name, version: "9.9.9" };
};
for (const pkg of REF_PACKAGES) {
  const dir = join(fakeInstall, "node_modules", REF_SCOPE, pkg);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "package.json"), JSON.stringify(fakeManifest(pkg)));
}
/** The same tree with one package deleted: a broken install. */
const brokenInstall = mkdtempSync(join(tmpdir(), "prism-refs-broken-"));
const brokenFrom = join(brokenInstall, "src", "x.ts");
mkdirSync(join(brokenInstall, "node_modules", REF_SCOPE, "design-system"), {
  recursive: true,
});
writeFileSync(
  join(
    brokenInstall,
    "node_modules",
    REF_SCOPE,
    "design-system",
    "package.json",
  ),
  JSON.stringify({ version: "9.9.9" }),
);

afterAll(() => {
  rmSync(fakeInstall, { recursive: true, force: true });
  rmSync(brokenInstall, { recursive: true, force: true });
});

describe("findInstalledPackage", () => {
  it("walks up to the nearest node_modules that holds the package", () => {
    expect(findInstalledPackage(`${REF_SCOPE}/design-system`, fakeFrom)).toBe(
      join(fakeInstall, "node_modules", REF_SCOPE, "design-system"),
    );
  });

  it("returns undefined when no ancestor holds it", () => {
    expect(
      findInstalledPackage(`${REF_SCOPE}/no-such-package`, fakeFrom),
    ).toBeUndefined();
  });
});

describe("installedRefRoots", () => {
  it("resolves every ref package to its directory, with the release it declares", () => {
    expect(installedRefRoots(fakeFrom)).toStrictEqual(
      REF_PACKAGES.map((pkg) =>
        pkg === UNVERSIONED || pkg === PRIVATE
          ? {
              package: pkg,
              dir: join(fakeInstall, "node_modules", REF_SCOPE, pkg),
            }
          : {
              package: pkg,
              dir: join(fakeInstall, "node_modules", REF_SCOPE, pkg),
              version: "9.9.9",
            },
      ),
    );
  });

  it("throws, naming the package, when one is not installed", () => {
    expect(() => installedRefRoots(brokenFrom)).toThrow(
      /@canonical\/code-standards is not installed next to @canonical\/prism-pragma-provider — run `bun install`/,
    );
  });

  it("finds the real dependencies after bun install", () => {
    // Read-only: the dependencies this package declares, where Bun put them.
    for (const root of installedRefRoots()) {
      expect(root.dir).toMatch(/node_modules/);
    }
  });

  it("versions the published packages and leaves the private shims unversioned", () => {
    // The demand model's shims are private workspace packages: the version
    // in their manifests is the workspace's, which names no release.
    const versions = Object.fromEntries(
      installedRefRoots().map((root) => [root.package, root.version]),
    );
    for (const pkg of ["design-system", "code-standards", "anatomy-dsl"]) {
      expect(versions[pkg], pkg).toMatch(/^\d+\.\d+\.\d+/);
    }
    expect(versions.surface).toBeUndefined();
    expect(versions["design-system-docs"]).toBeUndefined();
  });
});

describe("cacheRefRoots", () => {
  it("maps each package to its main ref in the cache", () => {
    expect(cacheRefRoots(CORPUS_REFS_ROOT)).toStrictEqual(
      REF_PACKAGES.map((pkg) => ({
        package: pkg,
        dir: join(CORPUS_REFS_ROOT, pkg, "main"),
      })),
    );
  });

  it("tolerates a published package absent from an existing cache", () => {
    // `code-standards` is not in the corpus; the entry is still produced and
    // the collector walks nothing under it. A partially populated cache is
    // the state a cache is actually in.
    expect(existsSync(join(CORPUS_REFS_ROOT, "code-standards"))).toBe(false);
    expect(cacheRefRoots(CORPUS_REFS_ROOT)).toHaveLength(REF_PACKAGES.length);
  });

  it("refuses a cache without the demand model, naming the package", () => {
    // The demand model is in every graph: a cache of the published packages
    // alone is incomplete, never a graph without journeys.
    expect(() => cacheRefRoots(CORPUS_EMPTY_REFS_ROOT)).toThrow(
      /@canonical\/surface is missing from the pragma refs cache at /,
    );
  });

  it("checks every package of the demand model", () => {
    // A cache holding `surface` but not `design-system-docs` is refused too.
    const partial = mkdtempSync(join(tmpdir(), "prism-refs-partial-"));
    mkdirSync(join(partial, "surface", "main"), { recursive: true });
    expect(() => cacheRefRoots(partial)).toThrow(
      /@canonical\/design-system-docs is missing from the pragma refs cache at /,
    );
    rmSync(partial, { recursive: true, force: true });
  });

  it("throws an actionable message when the cache root is missing", () => {
    expect(() => cacheRefRoots(MISSING_ROOT)).toThrow(
      /pragma refs cache not found at .*— run `pragma sources update`/,
    );
  });
});

describe("resolveRefRoots", () => {
  it("prefers an explicit cache root over everything", () => {
    vi.stubEnv("PRAGMA_REFS_DIR", MISSING_ROOT);
    expect(resolveRefRoots(CORPUS_REFS_ROOT)[0]?.dir).toBe(
      join(CORPUS_REFS_ROOT, "design-system", "main"),
    );
    vi.unstubAllEnvs();
  });

  it("then PRAGMA_REFS_DIR", () => {
    vi.stubEnv("PRAGMA_REFS_DIR", CORPUS_REFS_ROOT);
    expect(resolveRefsRoot()).toBe(CORPUS_REFS_ROOT);
    expect(resolveRefRoots()[0]?.dir).toBe(
      join(CORPUS_REFS_ROOT, "design-system", "main"),
    );
    vi.unstubAllEnvs();
  });

  it("then the installed packages — there is no cache default", () => {
    vi.stubEnv("PRAGMA_REFS_DIR", undefined);
    expect(resolveRefsRoot()).toBeUndefined();
    expect(resolveRefRoots()[0]?.dir).toMatch(/node_modules/);
    vi.unstubAllEnvs();
  });
});

describe("describeRefRoots", () => {
  it("names every root with its version, unversioned where there is none", () => {
    expect(
      describeRefRoots([
        { package: "design-system", dir: "/x", version: "0.43.0" },
        { package: "anatomy-dsl", dir: "/y" },
      ]),
    ).toBe("design-system@0.43.0 anatomy-dsl@unversioned");
  });
});
