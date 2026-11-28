import { describe, expect, it } from "vitest";
import { CATALOG_PRODUCTS, selectProductPage } from "./data.js";

describe("selectProductPage", () => {
  it("reads the first page with the catalog's totals", () => {
    const page = selectProductPage(4);

    expect(page.viewerName).toBe("Ada Lovelace");
    expect(page.products.map((product) => product.name)).toEqual(
      CATALOG_PRODUCTS.slice(0, 4).map((product) => product.name),
    );
    expect(page.totalCount).toBe(6);
    expect(page.hasNextPage).toBe(true);
  });

  it("reports the end of the catalog", () => {
    expect(selectProductPage(6).hasNextPage).toBe(false);
  });
});
