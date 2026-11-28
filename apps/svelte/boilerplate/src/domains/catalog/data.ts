import { products } from "./constants";

/** Finds a catalog product by `id`. */
export function findProduct(id: string) {
  return products.find((product) => product.id === id);
}
