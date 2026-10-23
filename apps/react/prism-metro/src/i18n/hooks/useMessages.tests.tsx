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
    expect(result.current("site.name")).toBe(MESSAGES["site.name"]);
  });

  it("reads through the translator a provider supplies", () => {
    const translate: Translate = (key) => `[${key}]`;
    const wrapper = ({ children }: { readonly children: ReactNode }) => (
      <MessagesContext value={translate}>{children}</MessagesContext>
    );
    const { result } = renderHook(() => useMessages(), { wrapper });
    expect(result.current("site.name")).toBe("[site.name]");
  });
});
