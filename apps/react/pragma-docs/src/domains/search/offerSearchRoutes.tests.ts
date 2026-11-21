import { describe, expect, it } from "vitest";
import offerSearchRoutes from "./offerSearchRoutes.js";
import { searchRoutes } from "./routes.js";

describe("offerSearchRoutes", () => {
  it("offers the search route when the provider serves search", () => {
    expect(offerSearchRoutes(["source", "search"])).toBe(searchRoutes);
  });

  it("offers no route when the provider does not serve search", () => {
    expect(offerSearchRoutes(["source", "values"])).toEqual({});
  });
});
