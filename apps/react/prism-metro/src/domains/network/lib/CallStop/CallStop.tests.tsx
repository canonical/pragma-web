// Scaffolded by @canonical/summon-component:react v0.43.0

import { HomesProvider } from "@canonical/prism-core";
import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  createRecordedEnvironment,
  readRecordedCalls,
  readRecordedLine,
} from "../../../../../testing/readRecordedViews.js";
import renderWithSite from "../../../../../testing/renderWithSite.js";
import CallStop from "./CallStop.js";

/** The environment the recorded answers are read from and rendered in. */
const RECORDED = createRecordedEnvironment();

const NORTH = readRecordedLine(RECORDED, "north-line");
const [NORTHGATE, , , CENTRAL_EXCHANGE] = readRecordedCalls(
  RECORDED,
  "north-line",
);

/** Render one of the North Line's calls in a list, as the strip does. */
const renderCall = (
  node: typeof NORTHGATE,
  props: Readonly<Record<string, unknown>> = {},
) =>
  renderWithSite(
    <ol>
      {node === undefined ? null : (
        <CallStop
          colour={NORTH.colour}
          lineUri={NORTH.uri}
          node={node}
          {...props}
        />
      )}
    </ol>,
    "/network",
    RECORDED,
  );

describe("CallStop", () => {
  it("ticks a plain station and links its name to its home", () => {
    const { container } = renderCall(NORTHGATE);
    const stop = container.querySelector(".ds.call-stop");
    expect(stop?.tagName).toBe("LI");
    expect(stop?.querySelector(".tick")).not.toBeNull();
    expect(stop?.querySelector(".ring")).toBeNull();
    expect(screen.getByRole("link", { name: "Northgate" })).toHaveAttribute(
      "href",
      "/network/stations/metro%3Anorthgate",
    );
    expect(stop?.querySelector(".transfer")).toBeNull();
  });

  it("rings an interchange and names the other lines it meets and its transfer", () => {
    const { container } = renderCall(CENTRAL_EXCHANGE);
    const stop = container.querySelector(".ds.call-stop") as HTMLElement;
    expect(stop).toHaveAttribute("data-type", "Interchange");
    expect(stop.querySelector(".ring")).not.toBeNull();
    expect(stop.querySelector(".tick")).toBeNull();
    expect(
      [...stop.querySelectorAll(".connection")].map((each) => each.textContent),
    ).toEqual(["2", "3"]);
    expect(stop.querySelector(".connection abbr")).toHaveAttribute(
      "title",
      "Circle Line",
    );
    expect(stop.querySelector(".transfer")?.textContent).toBe("4 min");
  });

  it("names a stop with no home as text", () => {
    renderWithSite(
      <HomesProvider homes={{}}>
        <ol>
          {NORTHGATE === undefined ? null : (
            <CallStop
              colour={NORTH.colour}
              lineUri={NORTH.uri}
              node={NORTHGATE}
            />
          )}
        </ol>
      </HomesProvider>,
      "/network",
      RECORDED,
    );
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.getByText("Northgate")).toHaveClass("name");
  });

  it("sets the line's colour on its channel, keeping the caller's style", () => {
    const { container } = renderCall(NORTHGATE, { style: { opacity: 1 } });
    const stop = container.querySelector(".ds.call-stop") as HTMLElement;
    expect(stop.style.getPropertyValue("--call-stop-colour")).toBe("#c8102e");
    expect(stop.style.opacity).toBe("1");
  });

  it("applies custom className after its own", () => {
    const { container } = renderCall(NORTHGATE, { className: "custom-class" });
    expect(container.querySelector("li")?.getAttribute("class")).toBe(
      "ds call-stop custom-class",
    );
  });

  it("passes through additional props", () => {
    renderCall(NORTHGATE, { "data-testid": "stop" });
    expect(screen.getByTestId("stop")).toBeInTheDocument();
  });
});
