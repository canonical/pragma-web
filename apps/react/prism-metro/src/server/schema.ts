/**
 * Write the metro provider's SDL, the contract followed by the provider's
 * extension, to `src/relay/schema.graphql`: the schema this app's Relay
 * project compiles the lens packages' documents against and its binding
 * check reads. `schema:check` reruns it and fails on a diff, so the
 * committed file cannot drift from the provider.
 */
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createExampleProvider } from "@canonical/prism-graph-example";

const schemaPath = fileURLToPath(
  new URL("../relay/schema.graphql", import.meta.url),
);

writeFileSync(schemaPath, `${createExampleProvider().sdl}\n`);

console.info(`[schema] wrote ${schemaPath}`);
