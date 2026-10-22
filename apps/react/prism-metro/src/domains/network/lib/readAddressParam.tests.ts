// @vitest-environment node

import { describe, expect, it } from "vitest";
import readAddressParam from "./readAddressParam.js";

describe("readAddressParam", () => {
  it("reads the address off the route's params", () => {
    expect(readAddressParam({ uri: "metro:northgate" })).toBe(
      "metro:northgate",
    );
  });

  it("throws on a missing, non-string or empty address", () => {
    expect(() => readAddressParam({})).toThrow(/non-empty string/);
    expect(() => readAddressParam({ uri: 7 })).toThrow(/non-empty string/);
    expect(() => readAddressParam({ uri: "" })).toThrow(/non-empty string/);
  });
});
