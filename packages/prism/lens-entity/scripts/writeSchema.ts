/**
 * Write the schema the lens's relay project compiles against: the contract
 * SDL with the `statements` extension (`readStatementsSdl`) merged into it,
 * to `.relay/schema.graphql`, a build output that is never committed.
 *
 * WHY THE EXTENSION IS MERGED RATHER THAN HANDED TO RELAY. relay-compiler
 * reads `extend type Query` as a CLIENT schema extension wherever it finds
 * it, and never sends such a field to the server. Printing the extended
 * schema puts `statements` inside `type Query`, where relay-compiler reads
 * it as a server field.
 *
 * Executed, never imported: it exports nothing.
 *
 * @note Impure: reads the contract's SDL and writes the merged schema.
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { readContractSdl, readStatementsSdl } from "@canonical/prism-contract";
import { buildSchema, extendSchema, parse, printSchema } from "graphql";

/** The file the lens's relay project reads (`relay.config.json`). */
const SCHEMA_PATH = fileURLToPath(
  new URL("../.relay/schema.graphql", import.meta.url),
);

const schema = extendSchema(
  buildSchema(readContractSdl()),
  parse(readStatementsSdl()),
);
mkdirSync(dirname(SCHEMA_PATH), { recursive: true });
writeFileSync(SCHEMA_PATH, `${printSchema(schema)}\n`);
