import { describe, expect, it } from "vitest";
import spellFrameAddress from "./spellFrameAddress.js";

describe("spellFrameAddress", () => {
  it("spells the address as the frame's query, keeping its own parameters", () => {
    expect(
      String(
        spellFrameAddress(
          "http://localhost/iframe.html?id=bar--x&viewMode=story&args=&globals=&query=old&status=a",
          "?status=deployed&q=web",
        ),
      ),
    ).toBe(
      "http://localhost/iframe.html?id=bar--x&viewMode=story&args=&globals=&query=status%3Ddeployed%26q%3Dweb",
    );
  });

  it("takes an address without its question mark", () => {
    expect(
      spellFrameAddress("http://localhost/", "q=web").searchParams.get("query"),
    ).toBe("q=web");
  });
});
