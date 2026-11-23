import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ORDERING_TOPIC } from "../common/index.js";
import useAnnouncer from "./useAnnouncer.js";

describe("useAnnouncer", () => {
  it("says nothing before the region mounts", () => {
    const { result } = renderHook(() => useAnnouncer());
    expect(result.current.ref.current).toBeNull();
    expect(() => result.current.announce("Sorted")).not.toThrow();
  });

  it("speaks through the mounted region, with its topic", () => {
    const { result } = renderHook(() => useAnnouncer());
    const announce = vi.fn();
    result.current.ref.current = { announce };
    result.current.announce("Sorted by name", ORDERING_TOPIC);
    expect(announce).toHaveBeenCalledWith("Sorted by name", ORDERING_TOPIC);
  });

  it("holds one identity across renders", () => {
    const { result, rerender } = renderHook(() => useAnnouncer());
    const { ref, announce } = result.current;
    rerender();
    expect(result.current.ref).toBe(ref);
    expect(result.current.announce).toBe(announce);
  });
});
