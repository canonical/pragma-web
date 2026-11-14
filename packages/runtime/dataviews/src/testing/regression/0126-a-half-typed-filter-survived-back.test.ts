/**
 * Regression: Back ends a filter's input session.
 *
 * Before the fix, the filter records re-synced only a predicate that moved,
 * so an invalid value typed into a bound survived Back to a query holding
 * the same bound: the input still read "4e" over a query that never asked
 * for it. A move of the location now ends every input session, and each
 * input shows what is applied.
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

describe("regression 0126 — a half-typed filter survived Back", () => {
  it("shows the applied bound once the reader goes Back", () => {
    const location = createMemoryLocation({
      href: "/machines?cpu__gte=4&page=2&size=50",
    });
    const provider = createDataViewsProvider({
      collection: machines,
      source: createManualSource({
        capabilities: declare({ filter: { cpu: ["gte"] } }),
        answer: answerWith([]),
      }).source,
      location,
    });
    const release = provider.observe();
    const inputs = createFilterInputs({ host: readProviderHost(provider) });
    const stop = inputs.observe();
    inputs.handles.cpu.gte.edit("4e");
    location.write(new URLSearchParams("cpu__gte=4&page=1&size=50"));
    expect(inputs.handles.cpu.gte.state.get().input).toBe("4");
    stop();
    release();
  });
});
