/**
 * The schema generator — the ONE writer of `src/relay/schema.graphql`.
 *
 * relay-compiler reads that file, so what it holds decides which operations
 * compile. It used to be written as a side effect of booting the graph
 * server, from whatever the booting machine had on disk. Two machines
 * produced two schemas, and the committed one was a snapshot of one
 * developer's disk that no gate could question.
 *
 * This script replaces that with a deterministic build from ONE generated
 * source: the pragma provider compiled over the ref packages it declares as
 * dependencies, at the versions its manifest and the lockfile name. The
 * docsite's demand model is among them, as the `@canonical/surface` and
 * `@canonical/design-system-docs` shims, so the journeys add-on's types are
 * generated like every other type. There is no authored half: the provider's
 * own extensions (`prose` and `search`) are emitted inside the generated
 * `type Query`, and nothing else is merged in, so the file is the provider's
 * emission byte for byte, provenance header included.
 *
 * `bun run schema:check` regenerates and diffs, so a change to any ref
 * package shows up as a diff in review, labelled by the header the provider
 * stamps (which package versions produced it).
 *
 * Executed, never imported: like the other entry points in this directory it
 * exports nothing. It boots the provider, which writes the SDL, and exits; no
 * server is started and nothing is served.
 */

import { relative } from "node:path";
import { fileURLToPath } from "node:url";
import { createPragmaProvider } from "@canonical/prism-pragma-provider";

/** The file relay-compiler reads (`relay.config.json` → `schema`). */
const SCHEMA_PATH = fileURLToPath(
  new URL("../relay/schema.graphql", import.meta.url),
);

const { api } = await createPragmaProvider({ sdlOutput: SCHEMA_PATH }).catch(
  (error: unknown): never => {
    console.error(
      "[schema] the provider failed to boot:",
      error instanceof Error ? error.message : error,
    );
    process.exit(1);
  },
);

console.info(
  `[schema] wrote ${relative(process.cwd(), SCHEMA_PATH)} (${api.diagnostics.length} diagnostics)`,
);
