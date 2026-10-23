import { defaultProjectionMaps } from "@canonical/prism-projections";
import { describe, expect, it } from "vitest";
import { LineRow } from "./LineRow/index.js";
import { metroProjectionMaps } from "./metroProjectionMaps.js";
import { StationCard } from "./StationCard/index.js";

describe("metroProjectionMaps", () => {
  it("cards stations and interchanges as stations", () => {
    expect(metroProjectionMaps.card.siteTypes?.Station).toBe(StationCard);
    expect(metroProjectionMaps.card.siteTypes?.Interchange).toBe(StationCard);
  });

  it("rows lines as lines", () => {
    expect(metroProjectionMaps.row.siteTypes?.Line).toBe(LineRow);
  });

  it("keeps the default arms for every other type", () => {
    expect(metroProjectionMaps.card.siteTypes?.Zone).toBeUndefined();
    expect(metroProjectionMaps.card.Node).toBe(defaultProjectionMaps.card.Node);
    expect(metroProjectionMaps.card.types).toBe(
      defaultProjectionMaps.card.types,
    );
    expect(metroProjectionMaps.row.Node).toBe(defaultProjectionMaps.row.Node);
    expect(metroProjectionMaps.chip).toBe(defaultProjectionMaps.chip);
    expect(metroProjectionMaps.command).toBe(defaultProjectionMaps.command);
  });
});
