import type { ProviderExtension } from "@canonical/prism-contract";
import { renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";
import RenderersProvider from "../Provider.js";
import useServesStatements from "./useServesStatements.js";

/** A wrapper whose provider serves `extensions`. */
const wrapServing =
  (extensions: readonly ProviderExtension[]) =>
  ({ children }: { readonly children: ReactNode }) => (
    <RenderersProvider
      defaults={{ list: [], page: [] }}
      extensions={extensions}
    >
      {children}
    </RenderersProvider>
  );

describe("useServesStatements", () => {
  it("is true where the provider serves statements", () => {
    const { result } = renderHook(useServesStatements, {
      wrapper: wrapServing(["source", "statements"]),
    });
    expect(result.current).toBe(true);
  });

  it("is false where the provider does not serve them", () => {
    const { result } = renderHook(useServesStatements, {
      wrapper: wrapServing(["source"]),
    });
    expect(result.current).toBe(false);
  });

  it("is false outside a provider", () => {
    const { result } = renderHook(useServesStatements);
    expect(result.current).toBe(false);
  });
});
