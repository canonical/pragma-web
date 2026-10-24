// Scaffolded by @canonical/summon-component:react v0.43.0

import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import ScaffoldedProbe from "./ScaffoldedProbe.js";

describe("ScaffoldedProbe SSR", () => {
  it("renders its label on the server", () => {
    expect(renderToString(<ScaffoldedProbe label="Fixture" />)).toContain(
      "Fixture",
    );
  });
});
