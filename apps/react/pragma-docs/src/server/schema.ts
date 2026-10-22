/**
 * The schema generator — the ONE writer of `src/relay/schema.graphql`.
 *
 * relay-compiler reads that file, so what it holds decides which operations
 * compile. It used to be written as a side effect of booting the graph
 * server, from whatever the booting machine had on disk: the pragma refs
 * cache at whichever revision `pragma sources update` last fetched, plus a
 * semantics working tree if one happened to be checked out next door. Two
 * machines produced two schemas, and the committed one was a snapshot of one
 * developer's disk that no gate could question.
 *
 * This script replaces that with a deterministic build:
 *
 *   1. the GENERATED half: the pragma provider compiled over the ref packages
 *      it declares as dependencies (`@canonical/design-system`,
 *      `@canonical/code-standards`, `@canonical/anatomy-dsl`, at the exact
 *      versions in its `package.json`), with the semantics tree deliberately
 *      skipped (`semRoot: null`) so a local checkout cannot leak into the
 *      committed file;
 *   2. the AUTHORED half: every file under `src/relay/extensions/`, merged in.
 *      Today that is the journeys add-on's types, which have no published
 *      source yet.
 *
 * `bun run schema:check` regenerates and diffs, so a change to either half
 * shows up as a diff in review, labelled by the provenance header the
 * provider stamps (which ref package versions produced the generated half).
 *
 * WHY THE MERGE IS TEXTUAL, AND WHY `extend type Query` IS SPLICED. An
 * extension file is ordinary SDL: its own types, plus the root fields it adds
 * in one `extend type Query { … }` block. That block cannot be left as it is:
 * relay-compiler reads `extend type` in a schema file as a CLIENT schema
 * extension, compiles the fields as `ClientExtension` selections and never
 * sends them to the server — the journeys operation would execute with its
 * root fields silently stripped. So the block's fields are spliced into the
 * generated `type Query { … }` and the rest of the file is appended as is.
 * Text rather than graphql-js, because the generated half comes from the
 * provider's own printer and must be committed byte-for-byte as emitted; a
 * reprint through the app's graphql would change it and lose the header.
 *
 * Executed, never imported: like the other entry points in this directory it
 * exports nothing. It boots the provider for its SDL and exits; no server is
 * started and nothing is served.
 */

import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { relative } from "node:path";
import { fileURLToPath } from "node:url";
import { createPragmaProvider } from "@canonical/prism-pragma-provider";

/** The file relay-compiler reads (`relay.config.json` → `schema`). */
const SCHEMA_PATH = fileURLToPath(
  new URL("../relay/schema.graphql", import.meta.url),
);

/** The authored extensions, merged after the generated SDL. */
const EXTENSIONS_DIR = fileURLToPath(
  new URL("../relay/extensions/", import.meta.url),
);

/** The one `extend type Query { … }` block an extension file may carry. */
const QUERY_EXTENSION = /^extend type Query \{\n([\s\S]*?)\n\}\n?/m;

/** The generated root type's closing brace, at column 0. */
const QUERY_BLOCK = /^type Query \{\n[\s\S]*?^\}/m;

const { api } = await createPragmaProvider({ semRoot: null }).catch(
  (error: unknown): never => {
    console.error(
      "[schema] the provider failed to boot:",
      error instanceof Error ? error.message : error,
    );
    process.exit(1);
  },
);

if (!QUERY_BLOCK.test(api.sdl)) {
  console.error("[schema] the emitted SDL carries no `type Query` block");
  process.exit(1);
}

let queryFields = "";
const appended: string[] = [];
for (const name of readdirSync(EXTENSIONS_DIR)
  .filter((entry) => entry.endsWith(".graphql"))
  .sort()) {
  const path = `${EXTENSIONS_DIR}${name}`;
  const label = relative(process.cwd(), path);
  const text = readFileSync(path, "utf-8");
  const extension = QUERY_EXTENSION.exec(text);
  if (extension?.[1]) {
    queryFields += `\n  # ---- from ${label} ----\n${extension[1]}\n`;
  }
  const rest = text.replace(QUERY_EXTENSION, "").trimEnd();
  appended.push(`# ---- authored extension: ${label} ----\n\n${rest}`);
}

const sdl = api.sdl
  .trimEnd()
  .replace(QUERY_BLOCK, (block) => `${block.slice(0, -1)}${queryFields}}`);

writeFileSync(SCHEMA_PATH, `${[sdl, ...appended].join("\n\n")}\n`, "utf-8");

console.info(
  `[schema] wrote ${relative(process.cwd(), SCHEMA_PATH)} (${api.diagnostics.length} diagnostics, ${appended.length} authored extension${appended.length === 1 ? "" : "s"})`,
);
