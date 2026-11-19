import { afterEach, describe, expect, it, vi } from "vitest";
import {
  type PresentationStore,
  WRITE_DELAY,
} from "../src/lib/presentation/index.js";
import createDeferred from "./createDeferred.js";
import flushPresentation from "./flushPresentation.js";

afterEach(() => {
  vi.useRealTimers();
});

describe("flushPresentation", () => {
  it("sends the gathering writes and waits for each to settle", async () => {
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
    const answer = createDeferred<{ readonly status: "saved" }>();
    const writes = vi
      .fn<PresentationStore["patchPresentation"]>()
      .mockReturnValue(answer.promise);
    let settled = false;
    setTimeout(() => {
      void writes({ view: "a" }, {}).then(() => {
        settled = true;
      });
      answer.resolve({ status: "saved" });
    }, WRITE_DELAY);
    await flushPresentation(writes);
    expect(writes).toHaveBeenCalledTimes(1);
    expect(settled).toBe(true);
  });
});
