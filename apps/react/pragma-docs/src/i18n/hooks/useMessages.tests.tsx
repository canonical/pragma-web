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
    expect(result.current("modifier.family")).toBe(MESSAGES["modifier.family"]);
  });

  it("fills a placeholder from the values", () => {
    const { result } = renderHook(() => useMessages());
    expect(result.current("block.version", { version: "2.1" })).toBe("v2.1");
  });

  it("selects the plural branch the count names", () => {
    const { result } = renderHook(() => useMessages());
    expect(result.current("family.modifiers", { count: 1 })).toBe("1 modifier");
    expect(result.current("family.modifiers", { count: 0 })).toBe(
      "0 modifiers",
    );
    expect(result.current("family.modifiers", { count: 5 })).toBe(
      "5 modifiers",
    );
  });

  it("returns the translator a provider supplies", () => {
    const translate: Translate = (key) => `fr:${key}`;
    const wrapper = ({ children }: { children: ReactNode }) => (
      <MessagesContext value={translate}>{children}</MessagesContext>
    );
    const { result } = renderHook(() => useMessages(), { wrapper });
    expect(result.current("standard.category")).toBe("fr:standard.category");
  });
});
