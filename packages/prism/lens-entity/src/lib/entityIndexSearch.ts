import { ENTITY_VIEW_PARAM } from "./constants.js";
import readEntityView from "./readEntityView.js";
import type { EntityIndexSearchSchema } from "./types.js";

/**
 * The index route's search schema, in the Standard Schema shape the router
 * validates search parameters with: it reads the view from
 * `ENTITY_VIEW_PARAM` and never fails, an unknown value reading as the
 * default view. Declaring it names the parameter in a site's route table,
 * so the index can read and write it under the site's own register.
 */
const entityIndexSearch: EntityIndexSearchSchema = {
  "~standard": {
    version: 1,
    vendor: "prism-lens-entity",
    validate: (value) => ({
      value: {
        view: readEntityView(
          (value as Readonly<Record<string, unknown>>)[ENTITY_VIEW_PARAM],
        ),
      },
    }),
  },
};

export default entityIndexSearch;
