import { renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { RovingProvider } from "../../../common/Roving/index.js";
import { Entry } from "../common/Entry/index.js";
import { Segment } from "../common/Segment/index.js";
import useQueryChip from "./useQueryChip.js";

/** A roving toolbar whose stop is elsewhere. */
const wrapper = ({ children }: { children: ReactNode }) => (
  <RovingProvider activeItem="other" onActiveItemChange={vi.fn()}>
    {children}
  </RovingProvider>
);

describe("useQueryChip", () => {
  it("makes the Entry the item, and the group named by the label", () => {
    const { result } = renderHook(
      () =>
        useQueryChip({
          id: "chip",
          label: "status",
          disabled: false,
          children: [
            <Segment key="field" onActivate={vi.fn()}>
              status
            </Segment>,
            <Entry key="entry" value="" onValueChange={vi.fn()} label="V" />,
          ],
        }),
      { wrapper },
    );
    expect(result.current.parts.map((part) => part.context.isItem)).toEqual([
      false,
      true,
    ]);
    expect(result.current.groupProps).toMatchObject({
      role: "group",
      "aria-label": "status",
    });
    expect(result.current.removeProps.tabIndex).toBe(-1);
  });

  it("makes a read-only chip's remove control the item, with its reason", () => {
    const { result } = renderHook(
      () =>
        useQueryChip({
          id: "chip",
          criticality: "error",
          disabled: false,
          removeLabel: "Remove",
          children: <Segment description="Refused: no">cpu</Segment>,
        }),
      { wrapper },
    );
    expect(result.current.removeProps["data-roving-item"]).toBe("chip:remove");
    expect(result.current.groupProps).toEqual({});
    const [description] = result.current.descriptions;
    expect(description?.isReferenced).toBe(true);
    expect(result.current.removeProps["aria-describedby"]).toBe(
      description?.id,
    );
    expect(result.current.isRemoveLink).toBe(false);
    expect(result.current.isRemoveInert).toBe(false);
  });
});
