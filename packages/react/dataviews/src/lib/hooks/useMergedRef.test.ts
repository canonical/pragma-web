import { renderHook } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import useMergedRef from "./useMergedRef.js";

describe("useMergedRef", () => {
  it("hands the node to an object ref and the part, and clears both on detach", () => {
    const ref = createRef<HTMLDivElement>();
    const release = vi.fn();
    const attach = vi.fn(() => release);
    const { result } = renderHook(() => useMergedRef(ref, attach));
    const node = document.createElement("div");
    const detach = result.current(node);
    expect(attach).toHaveBeenCalledWith(node);
    expect(ref.current).toBe(node);
    detach();
    expect(release).toHaveBeenCalledTimes(1);
    expect(ref.current).toBeNull();
  });

  it("runs a callback ref's own cleanup instead of a null call", () => {
    const cleanup = vi.fn();
    const ref = vi.fn(() => cleanup);
    const { result } = renderHook(() => useMergedRef(ref, () => undefined));
    const node = document.createElement("div");
    const detach = result.current(node);
    detach();
    expect(ref.mock.calls).toEqual([[node]]);
    expect(cleanup).toHaveBeenCalledTimes(1);
  });

  it("calls a callback ref with null when it returned no cleanup", () => {
    const ref = vi.fn();
    const { result } = renderHook(() => useMergedRef(ref, () => undefined));
    const node = document.createElement("div");
    result.current(node)();
    expect(ref.mock.calls).toEqual([[node], [null]]);
  });

  it("keeps its identity while the caller rebuilds its ref, and reaches the latest", () => {
    const attach = () => undefined;
    const first = vi.fn();
    const latest = vi.fn();
    const { result, rerender } = renderHook(
      ({ ref }) => useMergedRef(ref, attach),
      { initialProps: { ref: first } },
    );
    const merged = result.current;
    rerender({ ref: latest });
    expect(result.current).toBe(merged);
    result.current(document.createElement("div"));
    expect(first).not.toHaveBeenCalled();
    expect(latest).toHaveBeenCalledTimes(1);
  });

  it("works without a caller's ref", () => {
    const { result } = renderHook(() =>
      useMergedRef<HTMLDivElement>(undefined, () => undefined),
    );
    expect(() => result.current(document.createElement("div"))()).not.toThrow();
  });
});
