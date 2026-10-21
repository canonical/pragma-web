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
    expect(result.current("lens.label")).toBe(MESSAGES["lens.label"]);
  });

  it("fills every placeholder from the values", () => {
    const { result } = renderHook(() => useMessages());
    expect(result.current("page.title.term", { term: "ds:UIBlock" })).toBe(
      "ds:UIBlock — Definitions",
    );
  });

  it("selects a plural record's branch by count", () => {
    const { result } = renderHook(() => useMessages());
    expect(result.current("status.classes", { visible: 1, count: 1 })).toBe(
      "1 of 1 class",
    );
    expect(result.current("status.classes", { visible: 17, count: 29 })).toBe(
      "17 of 29 classes",
    );
  });

  it("leaves a placeholder with no value verbatim instead of throwing", () => {
    const { result } = renderHook(() => useMessages());
    expect(result.current("rail.count")).toBe("{matches} of {total}");
  });

  it("returns the translator a provider supplies", () => {
    const translate: Translate = (key) => `fr:${key}`;
    const wrapper = ({ children }: { children: ReactNode }) => (
      <MessagesContext value={translate}>{children}</MessagesContext>
    );
    const { result } = renderHook(() => useMessages(), { wrapper });
    expect(result.current("lens.label")).toBe("fr:lens.label");
  });
});
