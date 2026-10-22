/**
 * The types the config domain shares with the rest of the package.
 *
 * @module config/types
 */

import type { SchemaPluginApi } from "@canonical/ke-graphql";

/** One Turtle source, keyed by the path the store reports it under. */
export interface TtlSource {
  /** Store-visible path: `<package>/<relative path>`, forward slashes. */
  readonly path: string;
  /** The Turtle text, with channel-dotted references already escaped. */
  readonly content: string;
}

/** One Markdown prose sidecar, keyed by its path the way a TTL source is. */
export interface ProseSidecar {
  /** Store-visible path: `<package>/<relative path>`, forward slashes. */
  readonly path: string;
  /** The Markdown text, as written. */
  readonly content: string;
}

/**
 * One source package resolved to a directory on disk.
 *
 * `dir` is the directory whose `definitions/` and `data/` subdirectories
 * hold the package's Turtle. Where it comes from is the resolver's business
 * (an installed npm package, or a `<package>/main` entry in the pragma CLI's
 * refs cache); the collector only walks it.
 */
export interface RefRoot {
  /** The unscoped package name, which is also the store-visible path prefix. */
  readonly package: string;
  /** The directory holding `definitions/` and `data/`. */
  readonly dir: string;
  /** The package version, when the directory carries a `package.json`. */
  readonly version?: string;
}

/** The roots `collectTtlSources` walks. */
export interface SourceRoots {
  /** The ref packages, each resolved to a directory. */
  readonly refRoots: readonly RefRoot[];
  /**
   * The semantics working tree, or `null` to skip it deliberately. A string
   * that names a missing directory is announced as a miss; `null` is not.
   */
  readonly semRoot: string | null;
}

/** Options for {@link createPragmaProvider}. */
export interface PragmaProviderOptions {
  /**
   * A pragma refs cache (`<root>/<package>/main/{definitions,data}`) to read
   * the ref packages from instead of the installed npm packages. Default:
   * `$PRAGMA_REFS_DIR` when set, else the packages installed next to this one.
   */
  readonly refsRoot?: string;
  /**
   * The semantics working tree. Default: `$PRAGMA_SEM_DIR`, else the sibling
   * checkout. Pass `null` to compile the ref packages alone, whatever the
   * machine has — the schema the docsite commits is generated that way.
   */
  readonly semRoot?: string | null;
  /** Where to write the emitted SDL. Absent means no write. */
  readonly sdlOutput?: string;
}

/** What {@link createPragmaProvider} resolves to. */
export interface PragmaProvider {
  /** The fetch-native GraphQL handler. */
  readonly handle: (request: Request) => Promise<Response>;
  /** The compiled schema and its diagnostics, as ke-graphql registers them. */
  readonly api: SchemaPluginApi;
}
