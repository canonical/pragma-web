// @vitest-environment node

import { describe, expect, it } from "vitest";
import readFleetView from "./readFleetView.js";

describe("readFleetView", () => {
  it.each(["cards", "rows"])("reads the view %s by name", (view) => {
    expect(readFleetView(view)).toBe(view);
  });

  it.each([null, "", "grid", 3])(
    "reads cards for %s, which names no view",
    (value) => {
      expect(readFleetView(value)).toBe("cards");
    },
  );
});
