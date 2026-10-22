/**
 * Write the metro provider's SDL, the contract followed by the provider's
 * extension, to `src/relay/schema.graphql`: the schema this app's Relay
 * project compiles the lens packages' documents against and its binding
 * check reads. `schema:check` reruns it and fails on a diff, so the
 * committed file cannot drift from the provider.
 *
 * The provider adds its root fields (`prose`, `search`) in an `extend type
 * Query` block, which relay-compiler would read as a client schema
 * extension: it compiles a selection of such a field as a `ClientExtension`
 * and never sends it to the server. So the block's fields are spliced into
 * the contract's `type Query` before the file is written.
 */
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createExampleProvider } from "@canonical/prism-graph-example";
import spliceQueryExtension from "./spliceQueryExtension.js";

const schemaPath = fileURLToPath(
  new URL("../relay/schema.graphql", import.meta.url),
);

writeFileSync(
  schemaPath,
  `${spliceQueryExtension(createExampleProvider().sdl)}\n`,
);

console.info(`[schema] wrote ${schemaPath}`);
