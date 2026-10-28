// @vitest-environment node

import { describe, expect, it } from "vitest";
import { DEFAULT_PORT, HMR_PORT_OFFSET } from "./constants.js";
import resolveHmrPort from "./resolveHmrPort.js";

describe("resolveHmrPort", () => {
  it("listens just above the site's port", () => {
    expect(resolveHmrPort(31_000)).toBe(31_000 + HMR_PORT_OFFSET);
  });

  it("never shares the site's own port", () => {
    expect(resolveHmrPort(DEFAULT_PORT)).not.toBe(DEFAULT_PORT);
  });
});
