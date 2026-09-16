/**
 * The provider's host answered two questions of one fact: a record's
 * declared type, and whether a field applies to a record — which is that
 * type read against the field's scope. A renderer narrowing a column asked
 * the first, and one showing a field the second, so the scoping was read
 * two ways.
 *
 * The host names the type alone, and whether a field applies to a type is
 * one binding function every renderer asks.
 */

import { describe, expect, expectTypeOf, it } from "vitest";
import createManualSource from "../../../testing/createManualSource.js";
import type { ProviderHost } from "../../lib/bindings/index.js";
import {
  readApplicability,
  readProviderHost,
} from "../../lib/bindings/index.js";
import { createCollection } from "../../lib/collection/index.js";
import { createDataViewsProvider } from "../../lib/provider/index.js";

type Instance = { readonly id: string; readonly type: string };

describe("whether a field applies to a record", () => {
  it("is read from the type the host names, not asked of the host", () => {
    expectTypeOf<ProviderHost>().not.toHaveProperty("applicability");
    const collection = createCollection({
      identify: (instance: Instance) => instance.id,
      discriminator: "type",
      fields: [
        { field: "type", kind: "choices", options: ["container", "vm"] },
        { field: "image", kind: "text", appliesTo: ["container"] },
      ],
    });
    const { source } = createManualSource<Instance>();
    const provider = createDataViewsProvider({ collection, source });
    const host = readProviderHost(provider);
    const vm = { id: "v-1", type: "vm" };
    expect(readApplicability(collection, "image", host.readType(vm))).toBe(
      "not-applicable",
    );
  });
});
