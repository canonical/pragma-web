import { renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { NO_SITE_SWITCHES } from "../../../../testing/createSiteTree.js";
import ProjectionLinkProvider from "../ProjectionLinkProvider.js";
import useSiteSwitch from "./useSiteSwitch.js";

describe("useSiteSwitch", () => {
  it("returns the site's switch of the form when the site gives its switches", () => {
    const wrapper = ({ children }: { readonly children: ReactNode }) => (
      <ProjectionLinkProvider site={NO_SITE_SWITCHES}>
        {children}
      </ProjectionLinkProvider>
    );
    expect(
      renderHook(() => useSiteSwitch("row"), { wrapper }).result.current,
    ).toBe(NO_SITE_SWITCHES.row);
  });

  it("returns undefined when the site gives no switches", () => {
    const wrapper = ({ children }: { readonly children: ReactNode }) => (
      <ProjectionLinkProvider>{children}</ProjectionLinkProvider>
    );
    expect(
      renderHook(() => useSiteSwitch("chip"), { wrapper }).result.current,
    ).toBeUndefined();
  });

  it("throws when no ProjectionLinkProvider is mounted above", () => {
    // React reports the render error before rethrowing; keep the output clean.
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    try {
      expect(() => renderHook(() => useSiteSwitch("card"))).toThrow(
        "useSiteSwitch: no ProjectionLinkProvider above",
      );
    } finally {
      consoleError.mockRestore();
    }
  });
});
