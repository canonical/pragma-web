import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { QueryEntryInputProps } from "../types.js";
import useProviderState from "./useProviderState.js";

describe("useProviderState", () => {
  it("keeps the same value while the merger does not change", () => {
    const first = (props: QueryEntryInputProps) => props;
    const second = (props: QueryEntryInputProps) => props;
    const { result, rerender } = renderHook(
      ({ getInputProps }) => useProviderState({ getInputProps }),
      { initialProps: { getInputProps: first } },
    );
    const value = result.current;
    expect(value.getInputProps).toBe(first);
    rerender({ getInputProps: first });
    expect(result.current).toBe(value);
    rerender({ getInputProps: second });
    expect(result.current.getInputProps).toBe(second);
  });
});
