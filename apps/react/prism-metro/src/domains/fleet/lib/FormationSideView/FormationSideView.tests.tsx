import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  NORTH_LINE_PLATFORMS,
  SERIES_50_FOUR_CAR,
  SERIES_90_SIX_CAR,
  SERIES_90_THREE_CAR,
} from "../../../../../testing/fixtures.js";
import { CAR_HEIGHT, MARK_DROP } from "../../constants.js";
import measurePlatformFit from "../measurePlatformFit.js";
import orientCars from "../orientCars.js";
import FormationSideView from "./FormationSideView.js";

const SIX_CAR = orientCars(SERIES_90_SIX_CAR);

/** The drawing's SVG, which assistive technology does not see. */
const findDrawing = (container: HTMLElement): SVGSVGElement => {
  const drawing = container.querySelector("svg.drawing");
  if (!(drawing instanceof SVGSVGElement)) throw new Error("no drawing");
  return drawing;
};

describe("FormationSideView", () => {
  it("draws one body per car, hidden from assistive technology", () => {
    const { container } = render(<FormationSideView cars={SIX_CAR} />);
    const drawing = findDrawing(container);
    expect(drawing.querySelectorAll("path.car")).toHaveLength(6);
    expect(drawing).toHaveAttribute("aria-hidden", "true");
    expect(drawing).toHaveAttribute("viewBox", `0 0 120000 ${CAR_HEIGHT}`);
  });

  it("draws against a shared scale when given one", () => {
    const { container } = render(
      <FormationSideView
        cars={orientCars(SERIES_90_THREE_CAR)}
        scale={120000}
      />,
    );
    expect(findDrawing(container)).toHaveAttribute(
      "viewBox",
      `0 0 120000 ${CAR_HEIGHT}`,
    );
  });

  it("noses the rear cab of a reversed unit at the train's right end", () => {
    const { container } = render(
      <FormationSideView cars={orientCars(SERIES_50_FOUR_CAR)} />,
    );
    const last = [...findDrawing(container).querySelectorAll("path.car")].at(
      -1,
    );
    expect(last?.getAttribute("d")).toContain(`L62000 ${CAR_HEIGHT / 2}`);
  });

  it("repeats the train as text, unit by unit, each car by its code", () => {
    render(<FormationSideView cars={SIX_CAR} />);
    const units = within(screen.getByRole("list")).getAllByRole("listitem");
    expect(
      units.map((unit) =>
        [...unit.querySelectorAll(".label, .code")]
          .map((part) => part.textContent)
          .join(" "),
      ),
    ).toEqual(["Unit 1 DM T DM", "Unit 2 DM T DM"]);
  });

  it("describes each car for assistive technology, after its code", () => {
    render(<FormationSideView cars={SIX_CAR} />);
    const first = screen.getAllByRole("listitem").at(0) as HTMLElement;
    expect(first.querySelector(".description")).toHaveTextContent(
      "Series 90 driving motor car, cab at the front",
    );
    expect(first.querySelector(".code")?.nextElementSibling).toHaveClass(
      "description",
    );
  });

  it("leaves out the unit's label for a train of one unit", () => {
    render(
      <FormationSideView
        cars={SIX_CAR.filter((car) => car.unitPosition === 1)}
      />,
    );
    expect(document.querySelector(".label")).toBeNull();
  });

  it("names the train by its caption, above the drawing", () => {
    const { container } = render(
      <FormationSideView caption="Series 90 six-car" cars={SIX_CAR} />,
    );
    const caption = container.querySelector("figcaption.caption");
    expect(caption).toHaveTextContent("Series 90 six-car");
    expect(caption?.nextElementSibling).toHaveClass("drawing");
  });

  it("titles each car with its type and the way its cab faces", () => {
    render(<FormationSideView cars={orientCars(SERIES_50_FOUR_CAR)} />);
    const titles = [...document.querySelectorAll("abbr.code")].map((code) =>
      code.getAttribute("title"),
    );
    expect(titles).toEqual([
      "Series 50 driving motor car, cab at the front",
      "Series 50 trailer car",
      "Series 50 trailer car",
      "Series 50 driving motor car, cab at the rear",
    ]);
  });

  it("marks the shortest platform and underlines the overhang", () => {
    const fits = measurePlatformFit(120000, [NORTH_LINE_PLATFORMS]);
    const { container } = render(
      <FormationSideView cars={SIX_CAR} fits={fits} />,
    );
    const drawing = findDrawing(container);
    expect(drawing).toHaveAttribute(
      "viewBox",
      `0 0 120000 ${CAR_HEIGHT + MARK_DROP}`,
    );
    const mark = drawing.querySelector("line.mark");
    expect(mark).toHaveAttribute("x1", "100000");
    const overhang = drawing.querySelector("line.overhang");
    expect(overhang).toHaveAttribute("x1", "100000");
    expect(overhang).toHaveAttribute("x2", "120000");
  });

  it("widens its scale to hold a platform longer than the train", () => {
    const fits = measurePlatformFit(60000, [NORTH_LINE_PLATFORMS]);
    const { container } = render(
      <FormationSideView cars={orientCars(SERIES_90_THREE_CAR)} fits={fits} />,
    );
    const drawing = findDrawing(container);
    expect(drawing.getAttribute("viewBox")).toMatch(/^0 0 100000 /);
    expect(drawing.querySelector("line.overhang")).toBeNull();
  });

  it("marks each distinct platform length once, and skips unknown ones", () => {
    const fits = [
      { title: "A", code: "A", shortest: 100000, overhangs: [] },
      { title: "B", code: "B", shortest: 100000, overhangs: [] },
      { title: "C", code: "C", shortest: null, overhangs: [] },
    ];
    const { container } = render(
      <FormationSideView cars={SIX_CAR} fits={fits} />,
    );
    expect(findDrawing(container).querySelectorAll("line.mark")).toHaveLength(
      1,
    );
  });

  it("marks every line's shortest platform, underlining past the shortest", () => {
    const fits = [
      { title: "A", code: "A", shortest: 110000, overhangs: [] },
      { title: "B", code: "B", shortest: 100000, overhangs: [] },
    ];
    const { container } = render(
      <FormationSideView cars={SIX_CAR} fits={fits} />,
    );
    const drawing = findDrawing(container);
    const marks = [...drawing.querySelectorAll("line.mark")].map((mark) =>
      mark.getAttribute("x1"),
    );
    expect(marks).toEqual(["100000", "110000"]);
    expect(drawing.querySelector("line.overhang")).toHaveAttribute(
      "x1",
      "100000",
    );
  });

  it("passes native props to its figure and merges its class", () => {
    render(
      <FormationSideView aria-label="Side view" cars={SIX_CAR} className="x" />,
    );
    const figure = screen.getByRole("figure", { name: "Side view" });
    expect(figure).toHaveClass("ds", "formation-side-view", "x");
  });
});
