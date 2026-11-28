import { PAGE_SIZE } from "./constants.js";
import { selectProductPage } from "./data.js";

/** The catalog route's data: the first page of products. */
export default function loadCatalog() {
  return { catalog: selectProductPage(PAGE_SIZE) };
}
