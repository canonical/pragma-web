import { describe, expect, it } from "vitest";
import { OVERLAY_PLACEMENT } from "./constants.js";
import { coercePlacement, resolveLogicalPlacement } from "./utils/index.js";

describe("OVERLAY_PLACEMENT", () => {
  it("resolves to [right, bottom, left, top] centred in LTR", () => {
    expect(
      OVERLAY_PLACEMENT.map(
        (side) =>
          resolveLogicalPlacement(coercePlacement(side), "ltr").direction,
      ),
    ).toEqual(["right", "bottom", "left", "top"]);
  });
});
