/**
 * The relocated pragma knowledge: every fact about pragma's specific ontologies
 * that the docsite app used to carry, in one place.
 *
 * `REF_PACKAGES` is a PINNED CONSTANT, not a `PragmaProviderOptions` field.
 * Which packages the graph compiles decides which types the schema has, and
 * relay-compiler reads the schema the docsite commits. A second caller
 * passing a different list would silently compile a schema incompatible with
 * that file — the same class of divergence `mode` and `prefixing` are pinned
 * against in `createPragmaProvider`. One place, one answer to "what is in the
 * graph"; an option would turn that into "it depends who called".
 *
 * Two of the five packages are SHIMS: `surface` and `design-system-docs`,
 * the docsite's own demand model, live in this repository as private
 * workspace packages (`packages/prism/semantics/`) under the names the
 * published packages will have. They are dependencies of this package, so
 * `bun install` links them into `node_modules` like the published ones and
 * the collector cannot tell them apart. Their upstream fix is publishing the
 * two packages; the shims are then deleted and the published versions
 * pinned, and nothing in this file changes.
 *
 * The cost is real and accepted: a consumer who needs a different graph must
 * fork or send a PR.
 */

import { homedir } from "node:os";
import { join } from "node:path";

/** The npm scope the ref packages are published under. */
export const REF_SCOPE = "@canonical";

/**
 * The source packages whose TTL constitutes the docsite graph: declared as
 * this package's dependencies and read from `node_modules` by default, under
 * {@link REF_SCOPE}. `design-system`, `code-standards` and `anatomy-dsl` are
 * published on npm at exact versions; `surface` and `design-system-docs`, the
 * demand model, are the private shims in `packages/prism/semantics/`. A
 * pragma refs cache (`PRAGMA_REFS_DIR`) can stand in for them all, provided it
 * holds the demand model's two packages, see `resolveRefRoots.ts`. Each
 * package is named once, which is what keeps the collected paths unique.
 */
export const REF_PACKAGES: readonly string[] = [
  "design-system",
  "code-standards",
  "anatomy-dsl",
  "surface",
  "design-system-docs",
];

/**
 * The ref packages that hold the demand model, which every graph carries.
 *
 * A refs cache that lacks one of them is refused, naming the package, rather
 * than compiled into a graph without the demand model: what the graph holds is
 * never decided by which cache a variable points at.
 */
export const DEMAND_MODEL_PACKAGES: readonly string[] = [
  "surface",
  "design-system-docs",
];

/** The package subdirectories scanned for `.ttl` sources and their `.md` sidecars. */
export const TTL_DIRS: readonly string[] = ["definitions", "data"];

/**
 * The extension of a prose sidecar: a Markdown file beside the Turtle that
 * describes the entity its name names (`button.md`, `button.fr.md`).
 */
export const PROSE_EXTENSION = ".md";

/**
 * The ref (branch) directory under each package in the pragma CLI's refs
 * cache: `<cache>/<package>/main/{definitions,data}`. Only the cache layout
 * has it; an installed package holds `definitions/` and `data/` at its root.
 */
export const REF_NAME = "main";

/**
 * A Turtle prefix prologue declaration (`@prefix ex: <iri> .` or the
 * case-insensitive keyword form). The label group requires at least one
 * character so the default-namespace form (`@prefix : <iri>`) is skipped.
 *
 * It matches these characters ANYWHERE, which is why `harvestPrefixes` runs it
 * over a copy with comments and string literals blanked out
 * (`blankTurtleProse`) rather than over the raw source. Without that, a
 * retired declaration parked in a comment is harvested like a live one, and
 * last-wins hands the compiler a namespace the Turtle parser never applied.
 */
export const PREFIX_DECL = /(?:^|\s)@?prefix\s+([^\s:]+):\s*<([^>]*)>/gi;

/**
 * A channel-dotted local name reference (`ds:.subcomponent.accordion-item`):
 * a valid IRI but invalid Turtle, since a PN_LOCAL may not start with an
 * unescaped dot. Public data files reference experimental-channel entities
 * this way (the entities' own dot-prefixed files are excluded as sources), so
 * the reference is escaped (`ds:\.foo` — same IRI) rather than dropped; the
 * dangling target then reads as honest absence in the graph.
 *
 * The same characters inside an annotation or an IRI reference are DATA, not
 * a reference to escape, and a backslash there breaks the parse rather than
 * fixing it — so `escapeChannelDottedRefs` applies this through
 * `mapTurtleSyntax` and never touches prose.
 */
export const CHANNEL_DOTTED_REF = /\b([A-Za-z][\w-]*):\.(?=[A-Za-z_])/g;

/**
 * The pragma CLI's cache location (`pragma sources update` populates it).
 *
 * It is NOT a default any more: the ref packages are read from the installed
 * npm packages unless `PRAGMA_REFS_DIR` or the `refsRoot` option names a
 * cache. The constant stays so the override has a documented home to point
 * at, and so a message can name where the CLI keeps the cache.
 */
export const DEFAULT_REFS_ROOT: string = join(
  homedir(),
  ".cache",
  "pragma",
  "refs",
  "@canonical",
);
