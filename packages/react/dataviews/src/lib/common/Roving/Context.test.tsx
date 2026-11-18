import { renderHook } from "@testing-library/react";
import { useContext } from "react";
import { describe, expect, it } from "vitest";
import Context from "./Context.js";

describe("Roving Context", () => {
  it("holds no value outside a provider", () => {
    const { result } = renderHook(() => useContext(Context));
    expect(result.current).toBeUndefined();
  });
});
