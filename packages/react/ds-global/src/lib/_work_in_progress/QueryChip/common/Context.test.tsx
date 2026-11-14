import { renderHook } from "@testing-library/react";
import { useContext } from "react";
import { describe, expect, it } from "vitest";
import Context from "./Context.js";

describe("QueryChip Context", () => {
  it("reads as an unmounted, enabled chip with no id outside a chip", () => {
    const { result } = renderHook(() => useContext(Context));
    expect(result.current).toEqual({ isMounted: false, disabled: false });
  });
});
