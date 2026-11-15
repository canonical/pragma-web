import { describe, expect, it } from "vitest";
import elementAt from "./elementAt.js";

describe("elementAt", () => {
  it("reads the element at a position, counting back from a negative one", () => {
    expect(elementAt(["a", "b", "c"], 1)).toBe("b");
    expect(elementAt(["a", "b", "c"], -1)).toBe("c");
  });

  it("throws, naming the position and the length, when none is there", () => {
    expect(() => elementAt(["a"], 3)).toThrow(
      "expected an element at 3, found 1",
    );
  });
});
