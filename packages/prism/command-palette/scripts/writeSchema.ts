/**
 * Write the schema the package's relay project compiles against: the
 * contract SDL with the search extension (`schema/search.graphql`) merged
 * into it, to `.relay/schema.graphql`, a build output that is never
 * committed.
 *
 * WHY THE EXTENSION IS MERGED RATHER THAN HANDED TO RELAY. relay-compiler
 * reads `extend type Query` as a CLIENT schema extension wherever it finds
 * it: in `schemaExtensions`, in a `schemaDir`, or in the schema file itself.
 * It compiles `search` as a `ClientExtension` selection and never sends it
 * to the server, so the palette would query with its search silently
 * stripped. Printing the extended schema puts `search` inside `type Query`,
 * where relay-compiler reads it as a server field.
 *
 * Executed, never imported: it exports nothing.
 *
 * @note Impure: reads the contract SDL and the extension from disk and
 *   writes the merged schema.
 */

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { readContractSdl } from "@canonical/prism-contract";
import { buildSchema, extendSchema, parse, printSchema } from "graphql";

/** The extension the palette selects beside the contract. */
const SEARCH_SDL_PATH = fileURLToPath(
  new URL("../schema/search.graphql", import.meta.url),
);

/** The file the package's relay project reads (`relay.config.json`). */
const SCHEMA_PATH = fileURLToPath(
  new URL("../.relay/schema.graphql", import.meta.url),
);

const schema = extendSchema(
  buildSchema(readContractSdl()),
  parse(readFileSync(SEARCH_SDL_PATH, "utf8")),
);
mkdirSync(dirname(SCHEMA_PATH), { recursive: true });
writeFileSync(SCHEMA_PATH, `${printSchema(schema)}\n`);
