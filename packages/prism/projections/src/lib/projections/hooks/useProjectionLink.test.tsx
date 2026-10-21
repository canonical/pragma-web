import type { LinkComponentProps } from "@canonical/react-ds-global";
import { renderHook } from "@testing-library/react";
import type { ReactElement, ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { defaultProjectionMaps } from "../constants.js";
import ProjectionsProvider from "../Provider.js";
import useProjectionLink from "./useProjectionLink.js";

/** A site's router link adapter, reduced to the anchor it renders. */
const RouterLink = ({ href, children }: LinkComponentProps): ReactElement => (
  <a href={href}>{children}</a>
);

describe("useProjectionLink", () => {
  it("returns the link the nearest provider holds", () => {
    const wrapper = ({ children }: { readonly children: ReactNode }) => (
      <ProjectionsProvider
        LinkComponent={RouterLink}
        maps={defaultProjectionMaps}
      >
        {children}
      </ProjectionsProvider>
    );
    expect(
      renderHook(() => useProjectionLink(), { wrapper }).result.current,
    ).toBe(RouterLink);
  });

  it("returns the intrinsic anchor when the provider is given no link", () => {
    const wrapper = ({ children }: { readonly children: ReactNode }) => (
      <ProjectionsProvider maps={defaultProjectionMaps}>
        {children}
      </ProjectionsProvider>
    );
    expect(
      renderHook(() => useProjectionLink(), { wrapper }).result.current,
    ).toBe("a");
  });

  it("throws when no ProjectionsProvider is mounted above", () => {
    // React reports the render error before rethrowing; keep the output clean.
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    try {
      expect(() => renderHook(() => useProjectionLink())).toThrow(
        "useProjectionLink: no ProjectionsProvider above",
      );
    } finally {
      consoleError.mockRestore();
    }
  });
});
