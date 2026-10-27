// Scaffolded by @canonical/summon-component:react v0.43.0

import { fireEvent, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  createRecordedEnvironment,
  readRecordedLine,
} from "../../../../../testing/readRecordedViews.js";
import renderWithSite from "../../../../../testing/renderWithSite.js";
import RouteStrip from "./RouteStrip.js";

/** The environment the recorded answers are read from and rendered in. */
const RECORDED = createRecordedEnvironment();

const CIRCLE = readRecordedLine(RECORDED, "circle-line");
const NORTH = readRecordedLine(RECORDED, "north-line");
const RINGWAY = readRecordedLine(RECORDED, "ringway-clockwise");
const CIRCLE_STRIP = CIRCLE.strips.at(0) as (typeof CIRCLE.strips)[number];
const NORTH_STRIP = NORTH.strips.at(0) as (typeof NORTH.strips)[number];
const RINGWAY_STRIP = RINGWAY.strips.at(0) as (typeof RINGWAY.strips)[number];

describe("RouteStrip", () => {
  it("lists a route's stops in calling order, each linking to its page", () => {
    renderWithSite(
      <RouteStrip
        colour={NORTH.colour}
        lineUri={NORTH.uri}
        node={NORTH_STRIP.route}
      />,
      "/network",
      RECORDED,
    );
    const southbound = screen
      .getByRole("heading", { name: "To Marsh End" })
      .closest(".direction") as HTMLElement;
    expect(
      within(southbound)
        .getAllByRole("link")
        .map((link) => link.textContent),
    ).toEqual([
      "Northgate",
      "Verge Park",
      "Foundry Row",
      "Central Exchange",
      "Marsh End",
    ]);
    expect(
      within(southbound).getByRole("link", { name: "Northgate" }),
    ).toHaveAttribute("href", "/network/stations/metro%3Anorthgate");
  });

  it("renders each call as a CallStop, sharing the strip", () => {
    const { container } = renderWithSite(
      <RouteStrip
        colour={NORTH.colour}
        lineUri={NORTH.uri}
        node={NORTH_STRIP.route}
      />,
      "/network",
      RECORDED,
    );
    const southbound = container.querySelector(".direction") as HTMLElement;
    const stops = southbound.querySelectorAll(".stops > .ds.call-stop");
    expect(stops).toHaveLength(5);
    for (const stop of stops) expect(stop).toHaveClass("stop");
  });

  it("marks a loop as continuing at both ends", () => {
    const { container } = renderWithSite(
      <RouteStrip
        colour={CIRCLE.colour}
        lineUri={CIRCLE.uri}
        node={CIRCLE_STRIP.route}
      />,
      "/network",
      RECORDED,
    );
    const stops = container.querySelector(".stops");
    expect(stops?.firstElementChild).toHaveClass("continues");
    expect(stops?.lastElementChild).toHaveClass("continues");
  });

  it("marks no continuation on a linear route", () => {
    const { container } = renderWithSite(
      <RouteStrip
        colour={NORTH.colour}
        lineUri={NORTH.uri}
        node={NORTH_STRIP.route}
      />,
      "/network",
      RECORDED,
    );
    expect(container.querySelector(".continues")).toBeNull();
  });

  it("shows one direction at a time once hydrated, switched by the toggle", () => {
    renderWithSite(
      <RouteStrip
        colour={CIRCLE.colour}
        lineUri={CIRCLE.uri}
        node={CIRCLE_STRIP.route}
      />,
      "/network",
      RECORDED,
    );
    const clockwise = screen.getByRole("button", { name: "Clockwise" });
    const anticlockwise = screen.getByRole("button", { name: "Anticlockwise" });
    expect(clockwise).toHaveAttribute("aria-pressed", "true");
    expect(
      screen.queryByRole("heading", { name: "Anticlockwise" }),
    ).not.toBeInTheDocument();
    fireEvent.click(anticlockwise);
    expect(anticlockwise).toHaveAttribute("aria-pressed", "true");
    expect(
      screen.getByRole("heading", { name: "Anticlockwise" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Clockwise" }),
    ).not.toBeInTheDocument();
  });

  it("shows a route with no reverse alone, with no toggle", () => {
    renderWithSite(
      <RouteStrip
        colour={RINGWAY.colour}
        lineUri={RINGWAY.uri}
        node={RINGWAY_STRIP.route}
      />,
      "/network",
      RECORDED,
    );
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.getAllByRole("heading")).toHaveLength(1);
  });

  it("sets the line's colour on its channel, keeping the caller's style", () => {
    const { container } = renderWithSite(
      <RouteStrip
        colour={NORTH.colour}
        lineUri={NORTH.uri}
        node={NORTH_STRIP.route}
        style={{ opacity: 1 }}
      />,
      "/network",
      RECORDED,
    );
    const root = container.querySelector("section") as HTMLElement;
    expect(root.style.getPropertyValue("--route-strip-colour")).toBe("#c8102e");
    expect(root.style.opacity).toBe("1");
  });

  it("applies custom className after its own", () => {
    const { container } = renderWithSite(
      <RouteStrip
        className="custom-class"
        colour={NORTH.colour}
        lineUri={NORTH.uri}
        node={NORTH_STRIP.route}
      />,
      "/network",
      RECORDED,
    );
    expect(container.querySelector("section")?.getAttribute("class")).toBe(
      "ds route-strip custom-class",
    );
  });

  it("passes through additional props", () => {
    renderWithSite(
      <RouteStrip
        colour={NORTH.colour}
        data-testid="strip"
        lineUri={NORTH.uri}
        node={NORTH_STRIP.route}
      />,
      "/network",
      RECORDED,
    );
    expect(screen.getByTestId("strip")).toBeInTheDocument();
  });
});
