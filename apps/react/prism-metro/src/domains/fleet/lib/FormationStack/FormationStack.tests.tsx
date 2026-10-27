import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  SERIES_90_SIX_CAR,
  SERIES_90_THREE_CAR,
} from "../../../../../testing/fixtures.js";
import orientCars from "../orientCars.js";
import FormationStack from "./FormationStack.js";

const TRAINS = [
  { key: "three", cars: orientCars(SERIES_90_THREE_CAR) },
  { key: "six", cars: orientCars(SERIES_90_SIX_CAR) },
];

describe("FormationStack", () => {
  it("draws every train at the scale of the longest", () => {
    const { container } = render(<FormationStack trains={TRAINS} />);
    const widths = [...container.querySelectorAll("svg.drawing")].map((svg) =>
      svg.getAttribute("viewBox")?.split(" ").at(2),
    );
    expect(widths).toEqual(["120000", "120000"]);
  });

  it("passes native props to its root and merges its class", () => {
    render(
      <FormationStack className="x" data-testid="stack" trains={TRAINS} />,
    );
    expect(screen.getByTestId("stack")).toHaveClass(
      "ds",
      "formation-stack",
      "x",
    );
  });
});
