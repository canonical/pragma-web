import { readFileSync } from "node:fs";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { STATEMENTS_SCHEMA_RELATIVE_PATH } from "./constants.js";
import { resolveContractSchemaPath } from "./contractSdl.js";

/**
 * Absolute path of the `statements` extension's SDL, resolved once at
 * module load for whichever layout this module runs from.
 *
 * @note Impure: probes the filesystem once per process.
 */
export const STATEMENTS_SCHEMA_PATH: string = resolveContractSchemaPath(
  dirname(fileURLToPath(import.meta.url)),
  STATEMENTS_SCHEMA_RELATIVE_PATH,
);

/**
 * Read the `statements` extension's SDL as a string: the one text a provider
 * serves the extension by and a reader compiles its fragments against,
 * appended to the contract's SDL. Text rather than a schema for the reason
 * `readContractSdl` gives.
 *
 * @note Impure: reads the filesystem on every call.
 */
export const readStatementsSdl = (): string =>
  readFileSync(STATEMENTS_SCHEMA_PATH, "utf8");
