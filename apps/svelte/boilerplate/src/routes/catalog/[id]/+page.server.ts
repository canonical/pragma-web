import { error } from "@sveltejs/kit";
import { findProduct } from "../../../domains/catalog/data";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params, cookies, url }) => {
  const product = findProduct(params.id);
  if (!product) error(404, "Product not found");
  // Data belongs to this request, not to a module-level store.
  await Promise.resolve();
  return { product, visitor: cookies.get("visitor")?.slice(0, 40) || "Guest", view: url.searchParams.get("view") || "overview" };
};
