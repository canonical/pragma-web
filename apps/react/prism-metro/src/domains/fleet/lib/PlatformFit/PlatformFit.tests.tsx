import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  NORTH_LINE_PLATFORMS,
  UNMEASURED_LINE,
} from "../../../../../testing/fixtures.js";
import measurePlatformFit from "../measurePlatformFit.js";
import PlatformFit from "./PlatformFit.js";

describe("PlatformFit", () => {
  it("names each line by its code and title", () => {
    render(
      <PlatformFit fits={measurePlatformFit(60000, [NORTH_LINE_PLATFORMS])} />,
    );
    const line = screen.getByRole("listitem");
    expect(line.querySelector(".line-name")).toHaveTextContent("1 North Line");
    expect(line).toHaveTextContent("Shortest platform 100 m");
    expect(line).toHaveTextContent("Fits");
  });

  it("counts the stations overhung and lists each with its excess", () => {
    const { container } = render(
      <PlatformFit fits={measurePlatformFit(120000, [NORTH_LINE_PLATFORMS])} />,
    );
    expect(container.querySelector(".ds.badge.error")).toHaveTextContent("1");
    const overhangs = container.querySelector(".overhangs") as HTMLElement;
    expect(
      within(overhangs)
        .getAllByRole("listitem")
        .map((item) => item.textContent),
    ).toEqual(["Marsh End: 20 m past its 100 m platform"]);
  });

  it("leaves out the shortest platform of a line with none measured", () => {
    render(<PlatformFit fits={measurePlatformFit(60000, [UNMEASURED_LINE])} />);
    expect(screen.getByRole("listitem")).not.toHaveTextContent("Shortest");
  });

  it("says so when no line runs the formation", () => {
    render(<PlatformFit fits={[]} />);
    expect(
      screen.getByText("No line runs this formation."),
    ).toBeInTheDocument();
    expect(screen.queryByRole("list")).toBeNull();
  });

  it("passes native props to its root and merges its class", () => {
    render(<PlatformFit className="x" data-testid="fit" fits={[]} />);
    expect(screen.getByTestId("fit")).toHaveClass("ds", "platform-fit", "x");
  });

  it("names each line by what renderName makes of its fit", () => {
    const { container } = render(
      <PlatformFit
        fits={measurePlatformFit(60000, [NORTH_LINE_PLATFORMS])}
        renderName={({ title }) => <strong>{title.toUpperCase()}</strong>}
      />,
    );
    expect(container.querySelector(".line-name")).toHaveTextContent(
      "1 NORTH LINE",
    );
  });
});
