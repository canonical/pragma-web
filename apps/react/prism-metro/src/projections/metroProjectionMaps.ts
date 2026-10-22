import {
  defaultProjectionMaps,
  type ProjectionMaps,
} from "@canonical/prism-projections";
import { LineRow } from "./LineRow/index.js";
import { StationCard } from "./StationCard/index.js";

/**
 * The site's projection maps: the default `Node` arms for every
 * representation, with stations and interchanges carded as stations and
 * lines rowed as lines. Every other type, a fare zone among them, renders
 * through the `Node` arm.
 */
export const metroProjectionMaps: ProjectionMaps = {
  ...defaultProjectionMaps,
  card: {
    ...defaultProjectionMaps.card,
    Station: StationCard,
    Interchange: StationCard,
  },
  row: { ...defaultProjectionMaps.row, Line: LineRow },
};
