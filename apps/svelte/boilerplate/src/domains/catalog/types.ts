/** A product of the catalog. */
export interface Product {
  readonly id: string;
  /** The product name, which is data and stays untranslated. */
  readonly name: string;
  readonly tagline: string;
  /** The price in the currency's minor unit. */
  readonly priceCents: number;
  /** An ISO 4217 currency code. */
  readonly currency: string;
  /** Out of five. */
  readonly rating: number;
  readonly inStock: boolean;
}

/** One page of the catalog, as the product list renders it. */
export interface ProductPage {
  /** The signed-in viewer's name. */
  readonly viewerName: string;
  /** How many products the catalog holds in all. */
  readonly totalCount: number;
  /** Whether products beyond this page exist. */
  readonly hasNextPage: boolean;
  readonly products: readonly Product[];
}
