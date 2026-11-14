import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import applyRef from "./applyRef.js";

describe("applyRef", () => {
  it("writes an object ref and reports no cleanup", () => {
    const ref = createRef<string>();
    expect(applyRef(ref, "node")).toBeUndefined();
    expect(ref.current).toBe("node");
  });

  it("calls a callback ref and reports the cleanup it returned", () => {
    const cleanup = vi.fn();
    const ref = vi.fn(() => cleanup);
    expect(applyRef(ref, "node")).toBe(cleanup);
    expect(ref).toHaveBeenCalledWith("node");
  });

  it("reports no cleanup for a callback ref that returned none", () => {
    const ref = vi.fn();
    expect(applyRef(ref, "node")).toBeUndefined();
    expect(ref).toHaveBeenCalledWith("node");
  });

  it("does nothing without a ref", () => {
    expect(applyRef(undefined, "node")).toBeUndefined();
    expect(applyRef(null, "node")).toBeUndefined();
  });
});
