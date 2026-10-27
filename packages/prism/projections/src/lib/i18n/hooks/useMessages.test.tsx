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
    expect(result.current("list.view.label")).toBe(MESSAGES["list.view.label"]);
  });

  it("fills every placeholder from the values", () => {
    const { result } = renderHook(() => useMessages());
    expect(
      result.current("entity.context", { kind: "Class", location: "ds" }),
    ).toBe("Class in ds");
  });

  it("leaves a placeholder with no value verbatim instead of throwing", () => {
    const { result } = renderHook(() => useMessages());
    expect(result.current("chip.lead")).toBe("{lead}:");
  });

  it("returns the translator a provider supplies", () => {
    const translate: Translate = (key) => `fr:${key}`;
    const wrapper = ({ children }: { children: ReactNode }) => (
      <MessagesContext value={translate}>{children}</MessagesContext>
    );
    const { result } = renderHook(() => useMessages(), { wrapper });
    expect(result.current("list.empty")).toBe("fr:list.empty");
  });
});
