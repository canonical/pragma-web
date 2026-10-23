// Scaffolded by @canonical/summon-component:react v0.43.0

import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import UIProbe from "./UIProbe.js";

describe("UIProbe", () => {
  it("renders its root", () => {
    expect(renderToString(<UIProbe />)).toContain("uiprobe");
  });
});
