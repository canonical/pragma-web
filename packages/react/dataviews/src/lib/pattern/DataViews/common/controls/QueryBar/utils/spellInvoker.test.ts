import { describe, expect, it } from "vitest";
import spellInvoker from "./spellInvoker.js";

describe("spellInvoker", () => {
  it("names the dialog and the command a button runs on it", () => {
    expect(spellInvoker("show-modal", "sheet")).toEqual({
      commandfor: "sheet",
      command: "show-modal",
    });
    expect(spellInvoker("close", "sheet")).toEqual({
      commandfor: "sheet",
      command: "close",
    });
  });
});
