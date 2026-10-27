import { describe, expect, it } from "vitest";
import {
  SERIES_50_FOUR_CAR,
  SERIES_70_FIXED,
  SERIES_90_SIX_CAR,
  SERIES_90_THREE_CAR,
} from "../../../../testing/fixtures.js";
import orientCars from "./orientCars.js";

describe("orientCars", () => {
  it("keeps an unreversed unit's order and its cars' facings", () => {
    const cars = orientCars(SERIES_90_THREE_CAR);
    expect(cars.map(({ code, facing }) => [code, facing])).toEqual([
      ["DM", "front"],
      ["T", "front"],
      ["DM", "rear"],
    ]);
  });

  it("faces the rear driving car of a fixed formation backwards", () => {
    const cars = orientCars(SERIES_70_FIXED);
    expect(cars.map(({ code }) => code)).toEqual([
      "DM",
      "M",
      "T",
      "T",
      "M",
      "DM",
    ]);
    expect(cars.at(0)?.facing).toBe("front");
    expect(cars.at(-1)?.facing).toBe("rear");
  });

  it("flips a reversed unit's order and every car's facing", () => {
    const cars = orientCars(SERIES_50_FOUR_CAR);
    expect(
      cars.map(({ code, facing, unitPosition }) => [
        code,
        facing,
        unitPosition,
      ]),
    ).toEqual([
      ["DM", "front", 1],
      ["T", "front", 1],
      ["T", "rear", 2],
      ["DM", "rear", 2],
    ]);
  });

  it("puts a cab at each end of a back-to-back pair and none between", () => {
    const cabs = orientCars(SERIES_50_FOUR_CAR).map(({ hasCab }) => hasCab);
    expect(cabs).toEqual([true, false, false, true]);
  });

  it("numbers each car's unit from the front", () => {
    const units = orientCars(SERIES_90_SIX_CAR).map(
      ({ unitPosition }) => unitPosition,
    );
    expect(units).toEqual([1, 1, 1, 2, 2, 2]);
  });

  it("carries each car type's facts through unchanged", () => {
    const [first] = orientCars(SERIES_90_THREE_CAR);
    expect(first).toEqual({
      code: "DM",
      title: "Series 90 driving motor car",
      length: 20000,
      hasCab: true,
      facing: "front",
      unitPosition: 1,
    });
  });

  it("lists no cars for a formation with no units", () => {
    expect(orientCars([])).toEqual([]);
  });
});
