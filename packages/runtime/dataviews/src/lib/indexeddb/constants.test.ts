import { describe, expect, it } from "vitest";
import {
  DATABASE_VERSION,
  PINS,
  PREFERENCES,
  RECORD_VERSION,
  VIEWS,
} from "./constants.js";

describe("constants", () => {
  it("creates the first database version", () => {
    expect(DATABASE_VERSION).toBe(1);
  });

  it("reads and writes the first record version", () => {
    expect(RECORD_VERSION).toBe(1);
  });

  it("names the two object stores", () => {
    expect(VIEWS).toBe("views");
    expect(PREFERENCES).toBe("preferences");
  });

  it("keeps pins under their own preference target", () => {
    expect(PINS).toBe("pins");
  });
});
