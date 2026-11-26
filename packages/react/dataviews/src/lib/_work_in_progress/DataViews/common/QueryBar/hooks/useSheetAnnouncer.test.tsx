import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import useSheetAnnouncer from "./useSheetAnnouncer.js";

describe("useSheetAnnouncer", () => {
  it("speaks through the root until the sheet's region is there, then through it", () => {
    const announce = vi.fn();
    const { result, rerender } = renderHook(() =>
      useSheetAnnouncer({ announce }),
    );
    const first = result.current.announce;
    first("Added status is ready.");
    expect(announce).toHaveBeenCalledWith("Added status is ready.", undefined);
    const region = { announce: vi.fn() };
    result.current.regionRef.current = region;
    first("Removed status is ready.");
    expect(region.announce).toHaveBeenCalledWith(
      "Removed status is ready.",
      undefined,
    );
    expect(announce).toHaveBeenCalledOnce();
    rerender();
    expect(result.current.announce).toBe(first);
  });
});
