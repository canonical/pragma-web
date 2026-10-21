import { render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import { describe, expect, it } from "vitest";
import { defaultProjectionMaps } from "./constants.js";
import useProjectionMaps from "./hooks/useProjectionMaps.js";
import ProjectionsProvider from "./Provider.js";

/** Prints whether the maps in scope are the default ones. */
const MapsProbe = (): ReactElement => (
  <p>
    {useProjectionMaps() === defaultProjectionMaps ? "default maps" : "other"}
  </p>
);

describe("ProjectionsProvider", () => {
  it("hands its maps to every representation below it", () => {
    render(
      <ProjectionsProvider maps={defaultProjectionMaps}>
        <MapsProbe />
      </ProjectionsProvider>,
    );
    expect(screen.getByText("default maps")).toBeInTheDocument();
  });
});
