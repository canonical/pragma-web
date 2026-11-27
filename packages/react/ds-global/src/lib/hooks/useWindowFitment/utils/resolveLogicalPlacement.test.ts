import { describe, expect, it } from "vitest";
import coercePlacement from "./coercePlacement.js";
import resolveLogicalPlacement from "./resolveLogicalPlacement.js";

describe("resolveLogicalPlacement", () => {
  it("maps the inline axis by reading direction, block axis dir-invariant (LTR)", () => {
    const ltr = (side: Parameters<typeof coercePlacement>[0]) =>
      resolveLogicalPlacement(coercePlacement(side), "ltr").direction;
    expect(ltr("inline-start")).toBe("left");
    expect(ltr("inline-end")).toBe("right");
    expect(ltr("block-start")).toBe("top");
    expect(ltr("block-end")).toBe("bottom");
  });

  it("mirrors the inline axis in RTL, leaves the block axis untouched", () => {
    const rtl = (side: Parameters<typeof coercePlacement>[0]) =>
      resolveLogicalPlacement(coercePlacement(side), "rtl").direction;
    expect(rtl("inline-start")).toBe("right");
    expect(rtl("inline-end")).toBe("left");
    expect(rtl("block-start")).toBe("top");
    expect(rtl("block-end")).toBe("bottom");
  });

  it("passes the alignment through unmodified on an inline side", () => {
    expect(
      resolveLogicalPlacement({ side: "inline-end", align: "end" }, "ltr"),
    ).toEqual({ direction: "right", align: "end" });
    // An inline side's cross-axis is vertical, so alignment is dir-blind.
    expect(
      resolveLogicalPlacement({ side: "inline-end", align: "end" }, "rtl"),
    ).toEqual({ direction: "left", align: "end" });
  });

  it("mirrors start/end alignment on a block side in RTL", () => {
    // A block side's cross-axis is the READING axis, so `start` is the leading
    // edge: left in LTR, right in RTL. `end` is its counterpart.
    expect(
      resolveLogicalPlacement({ side: "block-end", align: "start" }, "ltr"),
    ).toEqual({ direction: "bottom", align: "start" });
    expect(
      resolveLogicalPlacement({ side: "block-end", align: "start" }, "rtl"),
    ).toEqual({ direction: "bottom", align: "end" });
    expect(
      resolveLogicalPlacement({ side: "block-start", align: "end" }, "rtl"),
    ).toEqual({ direction: "top", align: "start" });
  });

  it("leaves centre alignment alone on a block side in RTL", () => {
    // `center` is its own mirror.
    expect(
      resolveLogicalPlacement({ side: "block-end", align: "center" }, "rtl"),
    ).toEqual({ direction: "bottom", align: "center" });
  });

  it("headline: a leading-edge, top-aligned placement mirrors for free", () => {
    const placement = { side: "inline-end", align: "start" } as const;
    // LTR leading edge is the right; RTL leading edge is the left.
    expect(resolveLogicalPlacement(placement, "ltr")).toEqual({
      direction: "right",
      align: "start",
    });
    expect(resolveLogicalPlacement(placement, "rtl")).toEqual({
      direction: "left",
      align: "start",
    });
  });
});
