import { describe, expect, it, vi } from "vitest";
import { createManualSource, declare } from "../../../testing/index.js";
import { createSelection } from "../selection/index.js";
import type { SourceActionRunner } from "../source/index.js";
import createActionRunner from "./createActionRunner.js";

const capabilities = declare({
  actions: {
    archive: { targets: "explicit", limit: 2 },
    tag: { targets: "explicit", limit: null },
  },
});

/** A runner over a source running actions with `runAction`, and its selection. */
const createRunnerOver = (
  runAction: SourceActionRunner | undefined,
  selected: readonly string[] = [],
) => {
  const selection = createSelection(selected);
  const { source } = createManualSource({ capabilities, runAction });
  return {
    run: createActionRunner({ source, capabilities, selection }),
    selection,
  };
};

describe("createActionRunner", () => {
  it("runs over the selection, and leaves only the failures selected", async () => {
    const runAction = vi.fn<SourceActionRunner>(async () => [
      { target: "a", status: "succeeded" },
      { target: "b", status: "failed", reason: "locked" },
    ]);
    const { run, selection } = createRunnerOver(runAction, ["a", "b"]);
    const outcome = await run({ action: "archive", payload: "why" });
    expect(runAction).toHaveBeenCalledWith({
      action: "archive",
      targets: { kind: "explicit", ids: ["a", "b"] },
      payload: "why",
    });
    expect(outcome).toEqual({
      targets: ["a", "b"],
      status: "failed",
      succeeded: ["a"],
      failed: [{ target: "b", reason: "locked" }],
    });
    expect([...selection.state.get().ids]).toEqual(["b"]);
  });

  it("fails a target the source reports nothing for", async () => {
    const { run } = createRunnerOver(async () => []);
    const outcome = await run({ action: "tag", targets: ["a", "b", "c"] });
    expect(outcome.failed).toEqual([
      { target: "a", reason: "the source reported no outcome" },
      { target: "b", reason: "the source reported no outcome" },
      { target: "c", reason: "the source reported no outcome" },
    ]);
  });

  it("fails every target with the reason the source threw", async () => {
    const { run } = createRunnerOver(async () => {
      throw new Error("offline");
    });
    const outcome = await run({ action: "archive", targets: ["a"] });
    expect(outcome.failed).toEqual([{ target: "a", reason: "offline" }]);
  });

  it("refuses a source that runs no actions", async () => {
    const { run } = createRunnerOver(undefined, ["a"]);
    await expect(run({ action: "archive" })).rejects.toThrow(
      "this source runs no actions",
    );
  });

  it("refuses an action the source does not declare, inherited names included", async () => {
    const { run } = createRunnerOver(async () => [], ["a"]);
    await expect(run({ action: "delete" })).rejects.toThrow(
      'this source declares no "delete" action',
    );
    await expect(run({ action: "toString" })).rejects.toThrow(
      'this source declares no "toString" action',
    );
  });

  it("refuses a run that addresses no record", async () => {
    const { run } = createRunnerOver(async () => []);
    await expect(run({ action: "archive" })).rejects.toThrow(
      '"archive" addresses no record',
    );
  });

  it("refuses a run that addresses more records than the action allows", async () => {
    const { run } = createRunnerOver(async () => []);
    await expect(
      run({ action: "archive", targets: ["a", "b", "c"] }),
    ).rejects.toThrow('"archive" addresses at most 2 records at a time');
  });
});
