import { error } from "@sveltejs/kit";
import { findProduct } from "../../../../domains/catalog/data";
import type { PageLoad } from "./$types";
export const load: PageLoad = ({ params, url }) => {
  const product = findProduct(params.id);
  if (!product) error(404, "Product not found");
  return { product, visitor: "Guest", view: url.searchParams.get("view") || "overview" };
};
