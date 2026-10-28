// @vitest-environment node

/**
 * The committed schema, checked against a real compile: the pragma
 * provider is booted over the ref packages and the demand model's shims,
 * and the SDL it emits must equal `src/relay/schema.graphql` as a set of
 * types, fields, arguments and descriptions. Both are sorted and
 * reprinted before they are compared, so the order the compiler happens
 * to emit them in does not matter.
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createPragmaProvider } from "@canonical/prism-pragma-provider";
import { buildSchema, lexicographicSortSchema, printSchema } from "graphql";
import { describe, expect, it } from "vitest";

/** The provider boot is real, so the test compiles the whole graph. */
const BOOT_TIMEOUT_MS = 60_000;

/** The file relay-compiler reads. */
const SCHEMA_PATH = fileURLToPath(
  new URL("../relay/schema.graphql", import.meta.url),
);

/** The folder that holds the demand model's shim packages. */
const SEMANTICS_ROOT = fileURLToPath(
  new URL("../../../../../packages/prism/semantics/", import.meta.url),
);

/** Print an SDL document in one order: sorted, then reprinted. */
const printSorted = (sdl: string): string =>
  printSchema(lexicographicSortSchema(buildSchema(sdl)));

describe("the committed schema", () => {
  it(
    "is what the provider compiles from the ref packages and the demand model",
    { timeout: BOOT_TIMEOUT_MS },
    async () => {
      const { api } = await createPragmaProvider({ semRoot: SEMANTICS_ROOT });
      expect(printSorted(api.sdl)).toBe(
        printSorted(readFileSync(SCHEMA_PATH, "utf-8")),
      );
    },
  );
});
