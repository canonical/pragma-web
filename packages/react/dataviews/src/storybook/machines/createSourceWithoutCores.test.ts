import { describe, expect, it } from "vitest";
import createSourceWithoutCores from "./createSourceWithoutCores.js";

describe("createSourceWithoutCores", () => {
  it("can neither filter nor order by cores", () => {
    const { capabilities } = createSourceWithoutCores();
    expect(capabilities.filter).not.toHaveProperty("cores");
    expect(capabilities.sort.fields).not.toContain("cores");
    expect(capabilities.sort.fields).toContain("name");
  });
});
