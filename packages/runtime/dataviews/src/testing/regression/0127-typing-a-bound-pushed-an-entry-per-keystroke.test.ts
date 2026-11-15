/**
 * Regression: typing a bound enters history once per input session.
 *
 * Before the fix, every valid change to a typed bound pushed its own
 * history entry, so typing "48" into a number filter pushed one for 4 and
 * one for 48, and Back went through each keystroke. The first change in an
 * input session now takes the filter's mode — push by default — and every
 * later one replaces it. Leaving the input ends the session, and an edit
 * that changes nothing starts none.
 */

import { describe, expect, it } from "vitest";
import answerWith from "../../../testing/answerWith.js";
import createManualSource from "../../../testing/createManualSource.js";
import createRecordingLocation from "../../../testing/createRecordingLocation.js";
import declare from "../../../testing/declare.js";
import readId from "../../../testing/readId.js";
import { createCollection } from "../../lib/collection/index.js";
import { createFilterInputs } from "../../lib/filter/index.js";
import {
  createDataViewsProvider,
  readProviderHost,
} from "../../lib/provider/index.js";

const machines = createCollection({
  identify: readId,
  fields: [{ field: "cpu", kind: "number" }],
});

describe("regression 0127 — typing a bound pushed an entry per keystroke", () => {
  it("pushes the session's first change and replaces with the rest", () => {
    const { location, writes } = createRecordingLocation({ href: "/machines" });
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
    writes.length = 0;
    inputs.handles.cpu.gte.edit("4");
    inputs.handles.cpu.gte.edit("48");
    inputs.endSessions();
    // Reads as what is applied: it moves nothing, and starts no session.
    inputs.handles.cpu.gte.edit("48.0");
    inputs.handles.cpu.gte.edit("8");
    expect(writes).toEqual([
      ["cpu__gte=4&page=1&size=50", "push"],
      ["cpu__gte=48&page=1&size=50", "replace"],
      ["cpu__gte=8&page=1&size=50", "push"],
    ]);
    stop();
    release();
  });
});
