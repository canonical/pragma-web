import { describe, expect, it } from "vitest";
import readWireField from "./readWireField.js";

describe("readWireField", () => {
  it("reads a bare key as the field", () => {
    expect(readWireField("status")).toBe("status");
  });

  it("reads the part before the first delimiter", () => {
    expect(readWireField("cpu__gte")).toBe("cpu");
    expect(readWireField("a__b__c")).toBe("a");
  });
});
