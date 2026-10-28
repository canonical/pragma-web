import { existsSync, readFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import type { Plugin } from "vite";

/**
 * A package's import of one of its compiled artifacts, as relay-compiler's
 * ES module output is imported: `…/__generated__/<Name>.graphql.js`.
 */
const ARTIFACT_SPECIFIER = /\/__generated__\/([A-Za-z0-9_]+\.graphql)\.js$/;

/** What the plugin reads of a multi-project `relay.config.json`. */
interface RelayConfig {
  /** The directory every source and output is relative to. */
  readonly root?: string;
  /** Each source directory, by the project that compiles it. */
  readonly sources: Readonly<Record<string, string>>;
  /** Each project's options, of which the plugin reads the output. */
  readonly projects: Readonly<Record<string, { readonly output: string }>>;
}

/** Options of `redirectPackageArtifacts`. */
interface RedirectPackageArtifactsOptions {
  /** The app's root: the directory that holds its `src`. */
  readonly appRoot: string;
  /** The path of the app's `relay.config.json`. */
  readonly relayConfig: string;
}

/** Whether `path` lies inside `directory`. */
function isInside(path: string, directory: string): boolean {
  return !relative(directory, path).startsWith("..");
}

/**
 * A Vite plugin that runs the packages the app compiles on the app's own
 * Relay compile. The app's `relay.config.json` lists, beside the app's own
 * `src`, the source directories of the lens and projection packages it
 * renders, all compiled by the app's project against the app's schema.
 * When a module under one of those directories imports one of its
 * package's own artifacts, the plugin resolves the import to the artifact
 * of the same name the app's compile wrote, so the package's queries fetch
 * what the app's fragments read, the site's own spreads among them, and
 * every fragment reads from the store what that query fetched.
 *
 * It runs before Vite's own resolution, so the package's artifact is never
 * loaded. An artifact the app's compile has not written fails the import,
 * naming the artifact: `bun run relay` writes it.
 *
 * @param options - The app's root and its Relay configuration.
 * @returns The plugin.
 * @throws When the app's own `src` is not a source of the configuration.
 * @note Impure: reads the Relay configuration, and each redirected
 *   artifact's presence, from the file system.
 */
export default function redirectPackageArtifacts({
  appRoot,
  relayConfig,
}: RedirectPackageArtifactsOptions): Plugin {
  const config = JSON.parse(readFileSync(relayConfig, "utf8")) as RelayConfig;
  const base = resolve(dirname(relayConfig), config.root ?? ".");
  const appSource = join(appRoot, "src");
  const project = config.sources[relative(base, appSource)];
  const output = project === undefined ? undefined : config.projects[project];
  if (project === undefined || output === undefined) {
    throw new Error(
      `${relayConfig} compiles no project from ${appSource}, so the app has no artifacts to run the packages on`,
    );
  }
  const artifacts = resolve(base, output.output);
  const packageSources = Object.entries(config.sources)
    .filter(([, sourceProject]) => sourceProject === project)
    .map(([directory]) => resolve(base, directory))
    .filter((directory) => directory !== appSource);
  return {
    name: "prism-metro:redirect-package-artifacts",
    enforce: "pre",
    resolveId: {
      // The bundler calls the hook only for an artifact import, so every
      // other import resolves without a call into it.
      filter: { id: ARTIFACT_SPECIFIER },
      handler(source, importer) {
        const name = ARTIFACT_SPECIFIER.exec(source)?.at(1);
        const importerPath = importer?.split("?").at(0);
        if (
          name === undefined ||
          importerPath === undefined ||
          !packageSources.some((directory) => isInside(importerPath, directory))
        ) {
          return null;
        }
        const artifact = join(artifacts, `${name}.ts`);
        if (!existsSync(artifact)) {
          throw new Error(
            `${importerPath} imports ${name}, which the app's Relay compile has not written to ${artifacts}: run \`bun run relay\``,
          );
        }
        return artifact;
      },
    },
  };
}
