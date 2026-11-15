import { renderHook } from "@testing-library/react";
import { isValidElement, type ReactElement, type ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import ProjectionLinkProvider from "../../../projections/ProjectionLinkProvider.js";
import ProjectionPeek from "../ProjectionPeek.js";
import useProjectionPeek from "./useProjectionPeek.js";

/** The absolute IRI the tests peek at. */
const NODE_IRI = "https://ds.canonical.com/global.component.icon-button";

/** A site's peek, reduced to an element naming the IRI it was given. */
const sitePeek = (uri: string): ReactElement => (
  <span className="site-peek">{uri}</span>
);

describe("useProjectionPeek", () => {
  it("returns the site's peek for the IRI when the provider carries one", () => {
    const wrapper = ({ children }: { readonly children: ReactNode }) => (
      <ProjectionLinkProvider peek={sitePeek}>
        {children}
      </ProjectionLinkProvider>
    );
    const peek = renderHook(() => useProjectionPeek(NODE_IRI), { wrapper })
      .result.current;
    expect(isValidElement(peek) && peek.props).toEqual({
      className: "site-peek",
      children: NODE_IRI,
    });
  });

  it("returns the package's ProjectionPeek at the IRI when the site gives none", () => {
    const wrapper = ({ children }: { readonly children: ReactNode }) => (
      <ProjectionLinkProvider>{children}</ProjectionLinkProvider>
    );
    const peek = renderHook(() => useProjectionPeek(NODE_IRI), { wrapper })
      .result.current;
    expect(isValidElement(peek) && peek.type).toBe(ProjectionPeek);
    expect(isValidElement(peek) && peek.props).toEqual({ uri: NODE_IRI });
  });

  it("throws when no ProjectionLinkProvider is mounted above", () => {
    // React reports the render error before rethrowing; keep the output clean.
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    try {
      expect(() => renderHook(() => useProjectionPeek(NODE_IRI))).toThrow(
        "useProjectionPeek: no ProjectionLinkProvider above",
      );
    } finally {
      consoleError.mockRestore();
    }
  });
});
