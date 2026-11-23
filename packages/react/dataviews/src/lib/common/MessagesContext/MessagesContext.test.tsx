import type { DataViewsMessages } from "@canonical/dataviews-core";
import { resolveMessages } from "@canonical/dataviews-core/bindings";
import { renderHook } from "@testing-library/react";
import { useContext } from "react";
import { describe, expect, it } from "vitest";
import MessagesContext from "./MessagesContext.js";

describe("MessagesContext", () => {
  it("speaks English where nothing installed it", () => {
    const { result } = renderHook(() => useContext(MessagesContext));
    expect(result.current).toEqual(resolveMessages());
    expect(result.current.filters).toBe("Filters");
  });

  it("carries the installed words", () => {
    const words: DataViewsMessages = {
      ...resolveMessages(),
      filters: "Filtres",
    };
    const { result } = renderHook(() => useContext(MessagesContext), {
      wrapper: ({ children }) => (
        <MessagesContext value={words}>{children}</MessagesContext>
      ),
    });
    expect(result.current.filters).toBe("Filtres");
  });
});
