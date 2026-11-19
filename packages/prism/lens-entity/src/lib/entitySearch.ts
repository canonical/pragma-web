import { type ViewSearchSchema, viewSearch } from "@canonical/prism-core";
import selectFacetParams from "./selectFacetParams.js";

/**
 * The entity index's search schema: core's view search, which reads the
 * view's own parameters, and beside them every other parameter with a
 * value, which the index reads as a facet filter. It never fails.
 */
const entitySearch: ViewSearchSchema = {
  "~standard": {
    ...viewSearch["~standard"],
    validate: (value) => {
      const search = value as Readonly<Record<string, unknown>>;
      const read = viewSearch["~standard"].validate(value);
      if (read instanceof Promise || read.issues !== undefined) return read;
      return {
        value: {
          ...read.value,
          ...Object.fromEntries(
            selectFacetParams(search).map((name) => [name, search[name]]),
          ),
        },
      };
    },
  },
};

export default entitySearch;
