// Scaffolded by @canonical/summon-component:svelte v0.43.0

import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import ForeignBanner from "./ForeignBanner.js";

describe("ForeignBanner", () => {
  it("renders its root", () => {
    expect(renderToString(<ForeignBanner />)).toContain("foreign-banner");
  });
});
