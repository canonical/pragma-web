import { renderHook } from "@testing-library/react";
import { useContext } from "react";
import { describe, expect, it } from "vitest";
import Context from "./Context.js";

describe("Context", () => {
  it("is undefined outside a trigger", () => {
    const { result } = renderHook(() => useContext(Context));
    expect(result.current).toBeUndefined();
  });
});
