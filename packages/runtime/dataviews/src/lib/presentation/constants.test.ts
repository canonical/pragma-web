import { describe, expect, it } from "vitest";
import {
  HIDDEN_KEY,
  NO_PRESENTATION,
  ORDER_KEY,
  WIDTH_KEY_PREFIX,
  WRITE_DEADLINE,
  WRITE_DELAY,
} from "./constants.js";

describe("constants", () => {
  it("holds nothing in the empty arrangement, frozen", () => {
    expect(NO_PRESENTATION).toEqual({});
    expect(Object.isFrozen(NO_PRESENTATION)).toBe(true);
  });

  it("gathers changes for 200ms, and at most a second", () => {
    expect(WRITE_DELAY).toBe(200);
    expect(WRITE_DEADLINE).toBe(1000);
  });

  it("keeps the table's arrangement under the renderer's own keys", () => {
    expect(WIDTH_KEY_PREFIX).toBe("table.width.");
    expect(ORDER_KEY).toBe("table.order");
    expect(HIDDEN_KEY).toBe("table.hidden");
  });
});
