import { renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";
import MessagesContext from "../Context.js";
import { MESSAGES } from "../constants.js";
import type { Translate } from "../types.js";
import useMessages from "./useMessages.js";

describe("useMessages", () => {
  it("reads the English catalog when no translator is provided", () => {
    const { result } = renderHook(() => useMessages());
    expect(result.current("palette.label")).toBe(MESSAGES["palette.label"]);
  });

  it("fills every placeholder from the values", () => {
    const { result } = renderHook(() => useMessages());
    expect(result.current("search.empty", { text: "lay" })).toBe(
      "Nothing in the graph matches “lay”.",
    );
  });

  it("leaves a placeholder with no value verbatim instead of throwing", () => {
    const { result } = renderHook(() => useMessages());
    expect(result.current("search.empty")).toBe(
      "Nothing in the graph matches “{text}”.",
    );
  });

  it("returns the translator a provider supplies", () => {
    const translate: Translate = (key) => `fr:${key}`;
    const wrapper = ({ children }: { children: ReactNode }) => (
      <MessagesContext value={translate}>{children}</MessagesContext>
    );
    const { result } = renderHook(() => useMessages(), { wrapper });
    expect(result.current("palette.label")).toBe("fr:palette.label");
  });
});
