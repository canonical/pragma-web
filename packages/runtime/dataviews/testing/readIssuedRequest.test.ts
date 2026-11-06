import { describe, expect, it } from "vitest";
import readIssuedRequest from "./readIssuedRequest.js";

describe("readIssuedRequest", () => {
  it("reads an issued request, and fails loudly when none was", () => {
    expect(readIssuedRequest("r-1")).toBe("r-1");
    expect(() => readIssuedRequest(null)).toThrow(
      "expected the command to issue a request",
    );
  });
});
