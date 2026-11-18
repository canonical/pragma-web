import { renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";
import Provider from "../Provider.js";
import type { QueryEntryInputProps } from "../types.js";
import useQueryEntry from "./useQueryEntry.js";

describe("useQueryEntry", () => {
  it("returns nothing without a provider", () => {
    const { result } = renderHook(() => useQueryEntry());
    expect(result.current).toBeUndefined();
  });

  it("returns the host's props merger", () => {
    const getInputProps = (props: QueryEntryInputProps) => props;
    const wrapper = ({ children }: { children: ReactNode }) => (
      <Provider getInputProps={getInputProps}>{children}</Provider>
    );
    const { result } = renderHook(() => useQueryEntry(), { wrapper });
    expect(result.current?.getInputProps).toBe(getInputProps);
  });
});
