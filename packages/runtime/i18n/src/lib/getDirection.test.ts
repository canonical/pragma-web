import { describe, expect, it } from "vitest";
import {
  rightToLeftConfig as config,
  unlistedDirectionConfig,
} from "../../testing/fixtures.js";
import getDirection from "./getDirection.js";

describe("getDirection", () => {
  it("returns ltr for an undefined locale", () => {
    expect(getDirection(config, undefined)).toBe("ltr");
  });

  it("returns rtl for an rtl base language, ignoring region and case", () => {
    expect(getDirection(config, "ar")).toBe("rtl");
    expect(getDirection(config, "AR-EG")).toBe("rtl");
  });

  it("returns ltr for an ltr locale", () => {
    expect(getDirection(config, "en")).toBe("ltr");
  });

  it("returns ltr when no rtl locales are configured", () => {
    expect(getDirection(unlistedDirectionConfig, "ar")).toBe("ltr");
  });
});
