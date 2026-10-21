import { renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { defaultProjectionMaps } from "../constants.js";
import ProjectionsProvider from "../Provider.js";
import type { ProjectionMaps } from "../types.js";
import useProjectionMaps from "./useProjectionMaps.js";

describe("useProjectionMaps", () => {
  it("returns the maps the nearest provider holds", () => {
    const maps: ProjectionMaps = {
      ...defaultProjectionMaps,
      chip: { ...defaultProjectionMaps.chip },
    };
    const wrapper = ({ children }: { readonly children: ReactNode }) => (
      <ProjectionsProvider maps={maps}>{children}</ProjectionsProvider>
    );
    expect(
      renderHook(() => useProjectionMaps(), { wrapper }).result.current,
    ).toBe(maps);
  });

  it("throws when no ProjectionsProvider is mounted above", () => {
    // React reports the render error before rethrowing; keep the output clean.
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    try {
      expect(() => renderHook(() => useProjectionMaps())).toThrow(
        "useProjectionMaps: no ProjectionsProvider above",
      );
    } finally {
      consoleError.mockRestore();
    }
  });
});
