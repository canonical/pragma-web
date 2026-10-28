import { describe, expect, it, vi } from "vitest";
import buildNetworkLines from "../../../../../testing/buildNetworkLines.js";
import { ROUTED_STATION_COUNT } from "../../../../../testing/fixtures.js";
import renderWithSite from "../../../../../testing/renderWithSite.js";
import { buildNetworkGeometry } from "../geometry/index.js";
import SchematicMap from "./SchematicMap.js";

// Hold the canvas below the zoom where every name reads at 12px.
vi.mock("@canonical/prism-core", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@canonical/prism-core")>()),
  useGraphZoomBucket: () => "hubs",
}));

describe("SchematicMap below the full zoom", () => {
  it("draws every station without its name, keeping it as the link's title", () => {
    const { container } = renderWithSite(
      <SchematicMap
        geometry={buildNetworkGeometry(buildNetworkLines())}
        title="The network"
      />,
    );
    expect(container.querySelectorAll("g.station")).toHaveLength(
      ROUTED_STATION_COUNT,
    );
    expect(container.querySelector("text.label")).toBeNull();
    expect(container.querySelector("g.station title")?.textContent).not.toBe(
      "",
    );
  });
});
