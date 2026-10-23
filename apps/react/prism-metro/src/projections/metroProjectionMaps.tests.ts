import { defaultProjectionMaps } from "@canonical/prism-projections";
import { describe, expect, it } from "vitest";
import { LineRow } from "./LineRow/index.js";
import { metroProjectionMaps } from "./metroProjectionMaps.js";
import { StationCard } from "./StationCard/index.js";

describe("metroProjectionMaps", () => {
  it("cards stations and interchanges as stations", () => {
    expect(metroProjectionMaps.card.Station).toBe(StationCard);
    expect(metroProjectionMaps.card.Interchange).toBe(StationCard);
  });

  it("rows lines as lines", () => {
    expect(metroProjectionMaps.row.Line).toBe(LineRow);
  });

  it("keeps the default Node arms for every other type", () => {
    expect(metroProjectionMaps.card.Zone).toBeUndefined();
    expect(metroProjectionMaps.card.Node).toBe(defaultProjectionMaps.card.Node);
    expect(metroProjectionMaps.row.Node).toBe(defaultProjectionMaps.row.Node);
    expect(metroProjectionMaps.chip).toBe(defaultProjectionMaps.chip);
    expect(metroProjectionMaps.command).toBe(defaultProjectionMaps.command);
  });
});
