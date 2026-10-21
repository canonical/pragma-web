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
    expect(result.current("fields.heading")).toBe(MESSAGES["fields.heading"]);
  });

  it("fills every placeholder from the values", () => {
    const { result } = renderHook(() => useMessages());
    expect(
      result.current("page.title.entity", {
        title: "Northgate",
        lens: "Stations",
      }),
    ).toBe("Northgate — Stations");
  });

  it("selects a plural record's branch by count", () => {
    const { result } = renderHook(() => useMessages());
    expect(result.current("status.count", { visible: 1, count: 1 })).toBe(
      "1 of 1 entry",
    );
    expect(result.current("status.count", { visible: 5, count: 16 })).toBe(
      "5 of 16 entries",
    );
  });

  it("leaves a placeholder with no value verbatim instead of throwing", () => {
    const { result } = renderHook(() => useMessages());
    expect(result.current("page.type")).toBe("Instance of {type}");
  });

  it("returns the translator a provider supplies", () => {
    const translate: Translate = (key) => `fr:${key}`;
    const wrapper = ({ children }: { children: ReactNode }) => (
      <MessagesContext value={translate}>{children}</MessagesContext>
    );
    const { result } = renderHook(() => useMessages(), { wrapper });
    expect(result.current("fields.heading")).toBe("fr:fields.heading");
  });
});
