import { renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";
import AmbientNamespaceProvider from "../AmbientNamespaceProvider.js";
import useForeignPrefix from "./useForeignPrefix.js";

/** Render the hook for `curie` on a page whose ambient namespace is `namespace`. */
const renderPrefix = (curie: string, namespace?: string) =>
  renderHook(() => useForeignPrefix(curie), {
    wrapper:
      namespace === undefined
        ? undefined
        : ({ children }: { children: ReactNode }) => (
            <AmbientNamespaceProvider namespace={namespace}>
              {children}
            </AmbientNamespaceProvider>
          ),
  }).result.current;

describe("useForeignPrefix", () => {
  it("shows the prefix, with its colon, where no page declares a namespace", () => {
    expect(renderPrefix("ds:global.component.button")).toBe("ds:");
  });

  it("shows no prefix for a node of the page's own namespace", () => {
    expect(renderPrefix("ds:global.component.button", "ds")).toBeUndefined();
  });

  it("shows the prefix, with its colon, for a node of another namespace", () => {
    expect(renderPrefix("cs:react.component.props", "ds")).toBe("cs:");
  });

  it("shows no prefix for an address that did not compact", () => {
    expect(
      renderPrefix("https://ds.canonical.com/global.component.button", "ds"),
    ).toBeUndefined();
  });

  it("reads the nearest page's namespace", () => {
    const { result } = renderHook(() => useForeignPrefix("cs:x"), {
      wrapper: ({ children }: { children: ReactNode }) => (
        <AmbientNamespaceProvider namespace="ds">
          <AmbientNamespaceProvider namespace="cs">
            {children}
          </AmbientNamespaceProvider>
        </AmbientNamespaceProvider>
      ),
    });
    expect(result.current).toBeUndefined();
  });
});
