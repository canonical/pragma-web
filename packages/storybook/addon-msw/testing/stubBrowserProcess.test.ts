import { describe, expect, it } from "vitest";
import stubBrowserProcess from "./stubBrowserProcess.js";

describe("stubBrowserProcess", () => {
  it("hides the Node version until the restore runs", () => {
    const node = process.versions.node;
    const restore = stubBrowserProcess();
    expect(process.versions.node).toBeUndefined();
    expect(process.versions.v8).toBeTypeOf("string");
    restore();
    expect(process.versions.node).toBe(node);
  });
});
