import {
  defaultProjectionMaps,
  type ProjectionMaps,
} from "@canonical/prism-projections";
import { LineRow } from "./LineRow/index.js";
import { StationCard } from "./StationCard/index.js";

/**
 * The site's projection maps: the default maps for every form, with the
 * site's own arms for its own types: stations and interchanges carded as
 * stations and lines rowed as lines. Every other type, a fare zone among
 * them, renders through the `Node` arm.
 */
export const metroProjectionMaps: ProjectionMaps = {
  ...defaultProjectionMaps,
  card: {
    ...defaultProjectionMaps.card,
    siteTypes: { Station: StationCard, Interchange: StationCard },
  },
  row: { ...defaultProjectionMaps.row, siteTypes: { Line: LineRow } },
};
