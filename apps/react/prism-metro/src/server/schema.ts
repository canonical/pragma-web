/**
 * Write the metro provider's SDL, the contract followed by the provider's
 * extension, to `src/relay/schema.graphql`: the schema this app's Relay
 * project compiles the lens packages' documents against and its binding
 * check reads. `schema:check` reruns it and fails on a diff, so the
 * committed file cannot drift from the provider.
 *
 * The provider adds its root fields (`prose`, `search`) in one
 * `extend type Query { … }` block. relay-compiler reads `extend type` in a
 * schema file as a client schema extension: it compiles those fields as
 * `ClientExtension` selections and never sends them to the server, so the
 * palette's search would run with its root field stripped. The block's
 * fields are therefore spliced into the contract's `type Query { … }` and
 * the block itself is dropped; the rest of the SDL is written as emitted.
 * It writes the schema of the build without search beside it.
 */
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createExampleProvider } from "@canonical/prism-graph-example";

/** The file relay-compiler reads (`relay.config.json` → `schema`). */
const SCHEMA_PATH = fileURLToPath(
  new URL("../relay/schema.graphql", import.meta.url),
);

/**
 * The schema the provider serves with `PRISM_SEARCH=off`, without search:
 * Relay compiles against the full schema in both builds, and a test pins
 * the off build's extensions to this one.
 */
const NO_SEARCH_SCHEMA_PATH = fileURLToPath(
  new URL("../../testing/schema.no-search.graphql", import.meta.url),
);

/** An `extend type` or `extend interface` block, its kind, name and fields. */
const EXTENSION_BLOCK =
  /^extend (type|interface) (\w+) \{\n([\s\S]*?)\n\}\n\n?/m;

/**
 * Folds every `extend` block into the type or interface it extends: Relay
 * reads a field declared only in an `extend` block of a server schema as
 * client data and never sends it.
 */
const foldExtensions = (sdl: string): string => {
  const extension = EXTENSION_BLOCK.exec(sdl);
  if (extension === null) return sdl;
  const [, kind, name, fields] = extension;
  const target = new RegExp(
    `^(${kind} ${name}\\b[^{]*\\{\\n[\\s\\S]*?)\\n\\}`,
    "m",
  );
  if (!target.test(sdl)) {
    throw new Error(
      `[schema] the provider's SDL extends ${kind} ${name}, which it does not declare`,
    );
  }
  return foldExtensions(
    sdl
      .replace(EXTENSION_BLOCK, "")
      .replace(target, (_, block: string) => `${block}\n${fields}\n}`),
  );
};

writeFileSync(SCHEMA_PATH, `${foldExtensions(createExampleProvider().sdl)}\n`);
writeFileSync(
  NO_SEARCH_SCHEMA_PATH,
  `${foldExtensions(createExampleProvider(undefined, undefined, { search: false }).sdl)}\n`,
);

console.info(`[schema] wrote ${SCHEMA_PATH} and ${NO_SEARCH_SCHEMA_PATH}`);
