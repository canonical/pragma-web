/**
 * Regression: an edit canonical order moves past another conjunct stays in
 * its handle.
 *
 * With two conjuncts at one address, a handle edits the first. Typing a
 * value that sorts after the other conjunct moved the edit to the second
 * place, and the handle, which always followed the first, jumped to the
 * other conjunct: the input under the cursor showed a value the reader had
 * not typed, and the next keystroke replaced that conjunct instead. A
 * handle now keeps the conjunct it edits while that conjunct stands.
 */

import { describe, expect, it } from "vitest";
import answerWith from "../../../testing/answerWith.js";
import createManualSource from "../../../testing/createManualSource.js";
import declare from "../../../testing/declare.js";
import readId from "../../../testing/readId.js";
import { createCollection } from "../../lib/collection/index.js";
import { createFilterInputs } from "../../lib/filter/index.js";
import { createMemoryLocation } from "../../lib/location/index.js";
import {
  createDataViewsProvider,
  readProviderHost,
} from "../../lib/provider/index.js";

const machines = createCollection({
  identify: readId,
  fields: [{ field: "cpu", kind: "number" }],
});

describe("regression 0128 — an edit past another conjunct jumped the handle", () => {
  it("keeps the typed value in its handle and edits the same conjunct next", () => {
    const provider = createDataViewsProvider({
      collection: machines,
      source: createManualSource({
        capabilities: declare({ filter: { cpu: ["gte"] } }),
        answer: answerWith([]),
      }).source,
      location: createMemoryLocation({
        href: "/machines?cpu__gte=4&cpu__gte__1=8&page=1&size=50",
      }),
    });
    const release = provider.observe();
    const inputs = createFilterInputs({ host: readProviderHost(provider) });
    const stop = inputs.observe();
    const bound = inputs.handles.cpu.gte;
    // Canonical order reads numbers as text: 9 sorts after 8, and so does 90.
    bound.edit("9");
    expect(bound.state.get().input).toBe("9");
    bound.edit("90");
    expect(bound.state.get().input).toBe("90");
    expect(provider.state.get().slice.filter).toEqual([
      { field: "cpu", operator: "gte", operands: [8] },
      { field: "cpu", operator: "gte", operands: [90] },
    ]);
    stop();
    release();
  });
});
