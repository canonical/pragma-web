import { resolveMessages } from "@canonical/dataviews-core/bindings";
import { describe, expect, it } from "vitest";
import createTokenMessages from "./createTokenMessages.js";

describe("createTokenMessages", () => {
  const english = resolveMessages();
  const tokens = createTokenMessages(english);

  it("keeps every key of the English record", () => {
    expect(Object.keys(tokens)).toEqual(Object.keys(english));
  });

  it("replaces each message with a token naming its key", () => {
    for (const [key, message] of Object.entries(english)) {
      const token: unknown = Reflect.get(tokens, key);
      expect(typeof token).toBe(typeof message);
      expect(typeof token === "function" ? token() : token).toBe(`‹${key}›`);
    }
  });

  it("finds both a text and a worded message in the English record", () => {
    const kinds = new Set(
      Object.values(english).map((message) => typeof message),
    );
    expect(kinds).toEqual(new Set(["string", "function"]));
  });
});
