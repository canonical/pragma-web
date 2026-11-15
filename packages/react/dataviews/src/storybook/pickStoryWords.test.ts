import { describe, expect, it } from "vitest";
import pickStoryWords from "./pickStoryWords.js";

describe("pickStoryWords", () => {
  it("picks the messages arg", () => {
    const messages = { search: "Chercher" };
    expect(pickStoryWords({ messages })).toEqual({ messages });
  });

  it("picks nothing when no messages arg is set", () => {
    expect(pickStoryWords({})).toEqual({});
    expect(pickStoryWords({ messages: undefined })).toEqual({});
  });
});
