import type { Source } from "@canonical/dataviews-core";
import { describe, expect, it } from "vitest";
import createFailingSource from "../src/storybook/machines/createFailingSource.js";
import createMachineSource from "../src/storybook/machines/createMachineSource.js";
import type { Machine } from "../src/storybook/machines/types.js";
import readFailureReason from "./readFailureReason.js";

describe("readFailureReason", () => {
  it("reads the reason a story source fails with", async () => {
    await expect(readFailureReason(createFailingSource())).resolves.toBe(
      "the machine inventory could not be reached",
    );
  });

  it("waits for a failure delivered later, and stops the request after", async () => {
    let stopped = false;
    const source: Source<Machine> = {
      ...createMachineSource(),
      execute: (_request, deliver) => {
        queueMicrotask(() => {
          deliver({
            status: "failed",
            failure: { reason: "offline", cause: null, transient: true },
          });
        });
        return () => {
          stopped = true;
        };
      },
    };
    await expect(readFailureReason(source)).resolves.toBe("offline");
    expect(stopped).toBe(true);
  });
});
