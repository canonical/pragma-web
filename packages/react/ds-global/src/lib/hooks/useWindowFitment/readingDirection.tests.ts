import { describe, expect, it } from "vitest";
import {
  MENU_PLACEMENT,
  MENU_ROOT_PLACEMENT,
  OVERLAY_PLACEMENT,
} from "./readingDirection.js";
import { coercePlacement, resolveLogicalPlacement } from "./utils/index.js";

describe("preset placements", () => {
  const resolve = (
    placements:
      | readonly Parameters<typeof coercePlacement>[0][]
      | typeof MENU_PLACEMENT,
    dir: "ltr" | "rtl",
  ) => placements.map((p) => resolveLogicalPlacement(coercePlacement(p), dir));

  it("MENU_ROOT_PLACEMENT opens below, aligned to the trigger's LEADING edge", () => {
    // LTR: the leading edge is the left one, so the popup's left edge meets the
    // trigger's left edge (`align: "start"`).
    expect(resolve(MENU_ROOT_PLACEMENT, "ltr")[0]).toEqual({
      direction: "bottom",
      align: "start",
    });
    // RTL: the leading edge is the RIGHT one, so the same logical placement must
    // resolve to a trailing (right-edge) physical alignment.
    expect(resolve(MENU_ROOT_PLACEMENT, "rtl")[0]).toEqual({
      direction: "bottom",
      align: "end",
    });
  });

  it("MENU_ROOT_PLACEMENT mirrors its whole fallback chain in RTL", () => {
    const ltr = resolve(MENU_ROOT_PLACEMENT, "ltr");
    const rtl = resolve(MENU_ROOT_PLACEMENT, "rtl");
    // Horizontal overflow → the opposite edge, mirrored.
    expect(ltr[1]).toEqual({ direction: "bottom", align: "end" });
    expect(rtl[1]).toEqual({ direction: "bottom", align: "start" });
    // Vertical overflow → flip above, alignment still mirrored.
    expect(ltr[2]).toEqual({ direction: "top", align: "start" });
    expect(rtl[2]).toEqual({ direction: "top", align: "end" });
    // The lateral last resorts keep their dir-blind (vertical) alignment while
    // the SIDE mirrors.
    expect(ltr[4]).toEqual({ direction: "right", align: "start" });
    expect(rtl[4]).toEqual({ direction: "left", align: "start" });
  });

  it("MENU_PLACEMENT prefers the lateral side, top-aligned, before flipping", () => {
    // Lateral (inline) sides come first; the vertical (block) fallbacks last.
    const ltr = resolve(MENU_PLACEMENT, "ltr");
    // First choice: attach to the leading edge (right in LTR), top-aligned.
    expect(ltr[0]).toEqual({ direction: "right", align: "start" });
    // Then flip the alignment on the SAME lateral side (vertical overflow).
    expect(ltr[1]).toEqual({ direction: "right", align: "end" });
    // Only then flip to the opposite lateral side.
    expect(ltr[2]).toEqual({ direction: "left", align: "start" });
    // The vertical fallbacks come last.
    expect(ltr.at(-2)).toEqual({ direction: "bottom", align: "center" });
    expect(ltr.at(-1)).toEqual({ direction: "top", align: "center" });
  });

  it("MENU_PLACEMENT mirrors to the left in RTL", () => {
    const rtl = resolve(MENU_PLACEMENT, "rtl");
    expect(rtl[0]).toEqual({ direction: "left", align: "start" });
    expect(rtl[2]).toEqual({ direction: "right", align: "start" });
  });

  it("OVERLAY_PLACEMENT resolves to [right, bottom, left, top] centred in LTR", () => {
    expect(resolve(OVERLAY_PLACEMENT, "ltr").map((p) => p.direction)).toEqual([
      "right",
      "bottom",
      "left",
      "top",
    ]);
  });
});
