import type { Product, ProductPage } from "./types.js";

/** The signed-in demo viewer, whose name the list shows. */
export const VIEWER_NAME = "Ada Lovelace";

/**
 * The local product data the catalog reads, the same records as the React
 * app's mock schema. Replace this module with a call to a real endpoint.
 */
export const CATALOG_PRODUCTS: readonly Product[] = [
  {
    id: "Product:1",
    name: "Vanguard Workstation",
    tagline: "A certified Ubuntu desktop for heavy compilation workloads",
    priceCents: 189_900,
    currency: "USD",
    rating: 4.7,
    inStock: true,
  },
  {
    id: "Product:2",
    name: "Meridian Laptop 14",
    tagline: "Thin, quiet, and pre-loaded with your team's golden image",
    priceCents: 129_900,
    currency: "USD",
    rating: 4.5,
    inStock: true,
  },
  {
    id: "Product:3",
    name: "Beacon Micro Server",
    tagline: "A fanless edge node that fits in a network cabinet",
    priceCents: 64_900,
    currency: "USD",
    rating: 4.2,
    inStock: false,
  },
  {
    id: "Product:4",
    name: "Atlas Rack Server",
    tagline: "Dense compute for private-cloud deployments",
    priceCents: 449_900,
    currency: "USD",
    rating: 4.8,
    inStock: true,
  },
  {
    id: "Product:5",
    name: "Harbor NAS Enclosure",
    tagline: "Four bays of quiet, snapshot-friendly storage",
    priceCents: 89_900,
    currency: "USD",
    rating: 4.1,
    inStock: true,
  },
  {
    id: "Product:6",
    name: "Relay IoT Gateway",
    tagline: "Bridges field sensors onto your message bus securely",
    priceCents: 29_900,
    currency: "USD",
    rating: 3.9,
    inStock: false,
  },
];

/** Reads the first `count` products, with the totals the list shows. */
export function selectProductPage(count: number): ProductPage {
  return {
    viewerName: VIEWER_NAME,
    totalCount: CATALOG_PRODUCTS.length,
    hasNextPage: count < CATALOG_PRODUCTS.length,
    products: CATALOG_PRODUCTS.slice(0, count),
  };
}
