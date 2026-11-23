import { describe, expect, it } from "vitest";
import { buildStoredView } from "../../../testing/index.js";
import readSavedView from "./readSavedView.js";

const { pinned: _pin, ...fields } = buildStoredView();

describe("readSavedView", () => {
  it("reads a stored view's fields, without its scope or version", () => {
    const record = { ...fields, v: 1, scope: "machines" };
    expect(readSavedView(record, false)).toEqual(buildStoredView());
  });

  it("reads whether this viewer pinned it", () => {
    const record = { ...fields, v: 1, scope: "machines" };
    expect(readSavedView(record, true).pinned).toBe(true);
  });
});
