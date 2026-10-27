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
 */
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createExampleProvider } from "@canonical/prism-graph-example";

/** The file relay-compiler reads (`relay.config.json` → `schema`). */
const SCHEMA_PATH = fileURLToPath(
  new URL("../relay/schema.graphql", import.meta.url),
);

/** The provider's one `extend type Query { … }` block, with its fields. */
const QUERY_EXTENSION = /^extend type Query \{\n([\s\S]*?)\n\}\n\n?/m;

/** The contract's root type, up to its closing brace at column 0. */
const QUERY_BLOCK = /^(type Query \{\n[\s\S]*?)\n\}/m;

/**
 * Splice the fields of the SDL's `extend type Query` block into its
 * `type Query` block and drop the extension block.
 *
 * @param sdl - The provider's SDL.
 * @returns The SDL with every root field inside `type Query`.
 * @throws When the SDL carries no `type Query` or no `extend type Query`.
 */
const spliceQueryExtension = (sdl: string): string => {
  const extension = QUERY_EXTENSION.exec(sdl);
  if (extension === null || !QUERY_BLOCK.test(sdl)) {
    throw new Error(
      "[schema] the provider's SDL carries no `type Query` or no `extend type Query` block",
    );
  }
  const fields = extension.at(1);
  return sdl
    .replace(QUERY_EXTENSION, "")
    .replace(QUERY_BLOCK, (_, block: string) => `${block}\n${fields}\n}`);
};

writeFileSync(
  SCHEMA_PATH,
  `${spliceQueryExtension(createExampleProvider().sdl)}\n`,
);

console.info(`[schema] wrote ${SCHEMA_PATH}`);
