import { CATALOG_VIEW_PARAM } from "./constants.js";
import readCatalogView from "./readCatalogView.js";
import type { CatalogSearchSchema } from "./types.js";

/**
 * The catalog route's search schema, in the Standard Schema shape the
 * router validates search parameters with: it reads the view from
 * `CATALOG_VIEW_PARAM` and never fails, an unknown value reading as the
 * default view. Declaring it names the parameter in the route table, so
 * the catalog reads and writes it under the site's register. The view
 * never reaches the catalog's operation, so a warm store serves every view.
 */
const catalogSearch: CatalogSearchSchema = {
  "~standard": {
    version: 1,
    vendor: "pragma-docs",
    validate: (value) => ({
      value: {
        view: readCatalogView(
          (value as Readonly<Record<string, unknown>> | undefined)?.[
            CATALOG_VIEW_PARAM
          ],
        ),
      },
    }),
  },
};

export default catalogSearch;
