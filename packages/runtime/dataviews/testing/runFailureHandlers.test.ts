import { describe, expect, it, onTestFailed } from "vitest";
import runFailureHandlers from "./runFailureHandlers.js";

describe("runFailureHandlers", () => {
  it("rejects where the task keeps no handler list", async (context) => {
    await expect(runFailureHandlers(context)).rejects.toThrow(
      "vitest no longer keeps task.onFailed",
    );
  });

  it("runs every handler and collects what each threw", async (context) => {
    const ran: string[] = [];
    onTestFailed(() => {
      ran.push("quiet");
    });
    onTestFailed(() => {
      throw new Error("first");
    });
    onTestFailed(() => {
      throw "second";
    });
    await expect(runFailureHandlers(context)).resolves.toEqual([
      "first",
      "second",
    ]);
    expect(ran).toEqual(["quiet"]);
  });
});
