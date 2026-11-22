import { describe, expect, it } from "vitest";
import offerSearchRoutes from "./offerSearchRoutes.js";

const routes = { search: { url: "/search" } } as const;

describe("offerSearchRoutes", () => {
  it("offers the search routes when the provider serves search", () => {
    expect(offerSearchRoutes(["source", "search"], routes)).toBe(routes);
  });

  it("offers no route when the provider does not serve search", () => {
    expect(offerSearchRoutes(["source", "values"], routes)).toEqual({});
  });
});
