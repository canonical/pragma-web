/**
 * A sort term names one of the collection's own fields wherever an author
 * writes one: a provider's ordering command, and a source's declared default.
 * A misspelt field does not compile. Each refused call sits beside the same
 * call spelled correctly, so the expected error can only be the field's.
 * The provider's host, beside them, answers no fact the collection and the
 * row scopes already read.
 */

import { describe, expect, expectTypeOf, it } from "vitest";
import createManualSource from "../../../testing/createManualSource.js";
import { createCollection } from "../collection/index.js";
import { declareCapabilities } from "../source/index.js";
import createDataViewsProvider from "./createDataViewsProvider.js";
import type { ProviderHost } from "./types.js";

type Machine = { readonly id: string; readonly name: string };

const machines = createCollection({
  identify: (machine: Machine) => machine.id,
  fields: [{ field: "name", kind: "text" }],
});

describe("typed sort terms", () => {
  it("refuses a field the collection does not declare on the provider's command", () => {
    // Compiled, never run: the refusal is the compiler's.
    const orders = () => {
      const { source } = createManualSource<Machine>();
      const provider = createDataViewsProvider({
        collection: machines,
        source,
      });
      provider.setSort([{ field: "name", direction: "asc" }]);
      // @ts-expect-error - "nmae" is not one of the collection's fields.
      provider.setSort([{ field: "nmae", direction: "asc" }]);
    };
    expect(orders).toBeTypeOf("function");
  });

  it("refuses a field the collection does not declare in a declared default", () => {
    const declares = () => {
      declareCapabilities(machines, {
        sort: {
          fields: ["name"],
          terms: 1,
          default: [{ field: "name", direction: "asc" }],
        },
      });
      declareCapabilities(machines, {
        sort: {
          fields: ["name"],
          terms: 1,
          // @ts-expect-error - "nmae" is not one of the collection's fields.
          default: [{ field: "nmae", direction: "asc" }],
        },
      });
    };
    expect(declares).toBeTypeOf("function");
  });
});

describe("ProviderHost", () => {
  it("answers neither a row's type nor whether a field applies to it", () => {
    // A row's type is the collection's compiled reader's, published by the
    // row scopes; whether a field applies is `readApplicability`'s.
    expectTypeOf<ProviderHost>().not.toHaveProperty("readType");
    expectTypeOf<ProviderHost>().not.toHaveProperty("applicability");
  });
});
