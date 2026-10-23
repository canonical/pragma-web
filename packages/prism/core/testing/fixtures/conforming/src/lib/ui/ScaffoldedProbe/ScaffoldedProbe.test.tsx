// Scaffolded by @canonical/summon-component:react v0.43.0

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ScaffoldedProbe from "./ScaffoldedProbe.js";

describe("ScaffoldedProbe", () => {
  it("renders its label", () => {
    render(<ScaffoldedProbe label="Fixture" />);
    expect(screen.getByText("Fixture")).toBeInTheDocument();
  });
});
