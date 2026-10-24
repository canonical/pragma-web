import type { MessageKey } from "#i18n";
import type {
  JourneyGroupKey,
  JourneySortKey,
} from "../../journeyTableModel.js";

/**
 * The table's sortable columns, in render order, each with the sort key it
 * carries and its header's message; a numeric column aligns to the end.
 */
export const JOURNEY_COLUMNS: readonly {
  readonly key: JourneySortKey;
  readonly label: MessageKey;
  readonly numeric?: boolean;
}[] = [
  { key: "job", label: "journeys.column.job" },
  { key: "coordinate", label: "journeys.column.coordinate" },
  { key: "role", label: "journeys.column.role" },
  { key: "fluency", label: "journeys.column.fluency" },
  { key: "pairings", label: "journeys.column.pairings", numeric: true },
  { key: "surface", label: "journeys.column.surface" },
  { key: "served", label: "journeys.column.served" },
];

/** The grouping axes the control offers, in order, with their messages. */
export const JOURNEY_GROUPS: readonly {
  readonly key: JourneyGroupKey;
  readonly label: MessageKey;
}[] = [
  { key: "coordinate", label: "journeys.table.group.coordinate" },
  { key: "role", label: "journeys.table.group.role" },
  { key: "served", label: "journeys.table.group.served" },
  { key: "none", label: "journeys.table.group.none" },
];

/** The id of the grouping control's label, which names its group. */
export const GROUPING_LABEL_ID = "journey-table-grouping";
