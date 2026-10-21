import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PREFIXES } from "../../../testing/fixtures.js";
import {
  BOX_ENCODINGS,
  CHANNEL_DESCRIPTORS,
  KIND_ENCODINGS,
  LIFECYCLE_ENCODINGS,
} from "./constants.js";
import ChipLegend from "./Legend.js";

describe("ChipLegend", () => {
  it("renders one group per channel, titled from the descriptors", () => {
    render(<ChipLegend prefixes={PREFIXES} />);
    for (const channel of CHANNEL_DESCRIPTORS) {
      expect(screen.getByText(channel.label)).toBeInTheDocument();
      expect(screen.getByText(channel.description)).toBeInTheDocument();
    }
  });

  it("lists one namespace swatch per prefix, in the prefixes' order", () => {
    render(<ChipLegend prefixes={PREFIXES} />);
    const group = screen.getByRole("region", { name: "Tint — namespace" });
    expect(
      [...group.querySelectorAll(".chip[data-uri]")].map((swatch) =>
        swatch.getAttribute("data-namespace"),
      ),
    ).toEqual([...PREFIXES]);
    expect(within(group).getByText("cs:")).toBeInTheDocument();
  });

  it("generates every other entry from the encoding rows", () => {
    render(<ChipLegend prefixes={PREFIXES} />);
    for (const row of BOX_ENCODINGS) {
      expect(screen.getByText(row.label)).toBeInTheDocument();
    }
    for (const row of KIND_ENCODINGS) {
      expect(
        screen.getByText(`${row.label} (${row.shape})`),
      ).toBeInTheDocument();
    }
    for (const row of LIFECYCLE_ENCODINGS) {
      expect(screen.getByText(row.label)).toBeInTheDocument();
    }
  });

  it("renders every swatch as a real chip through the shared pipeline", () => {
    const { container } = render(<ChipLegend prefixes={PREFIXES} />);
    const expectedSwatchCount =
      PREFIXES.length +
      BOX_ENCODINGS.length +
      KIND_ENCODINGS.length +
      LIFECYCLE_ENCODINGS.length;
    const swatches = container.querySelectorAll(".chip[data-uri]");
    expect(swatches).toHaveLength(expectedSwatchCount);
    const first = swatches.item(0) as HTMLElement;
    expect(first.style.getPropertyValue("--chip-tint")).not.toBe("");
  });

  it("tints the other groups' swatches with the first prefix", () => {
    render(<ChipLegend prefixes={PREFIXES} />);
    const group = screen.getByRole("region", { name: "Dot — lifecycle" });
    for (const swatch of group.querySelectorAll(".chip[data-uri]")) {
      expect(swatch).toHaveAttribute("data-namespace", "ds");
    }
  });

  it("renders an empty namespace group, and unknown tints, with no prefixes", () => {
    render(<ChipLegend prefixes={[]} />);
    const group = screen.getByRole("region", { name: "Tint — namespace" });
    expect(group.querySelectorAll(".chip[data-uri]")).toHaveLength(0);
    const kinds = screen.getByRole("region", { name: "Shape — entity family" });
    const swatch = kinds.querySelector(".chip[data-uri]") as HTMLElement;
    expect(swatch.style.getPropertyValue("--chip-tint")).toContain(
      "--chip-tint-unknown",
    );
  });

  it("passes native props through and merges a consumer className", () => {
    render(
      <ChipLegend
        className="is-compact"
        data-testid="legend"
        prefixes={PREFIXES}
      />,
    );
    expect(screen.getByTestId("legend").className).toBe(
      "ds chip-legend is-compact",
    );
  });
});
