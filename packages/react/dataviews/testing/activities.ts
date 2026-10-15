/**
 * The activity collection the Timeline tests share: an event record with a
 * date, an actor and a kind, its collection, the declaration a complete
 * local source makes over it, the mapping a timeline reads it through, and a
 * provider over a manual source the test answers by hand or at once.
 */

import {
  type CapabilityDeclaration,
  type Collection,
  createCollection,
  createDataViewsProvider,
  createPage,
  type DataViewsProvider,
  type DataViewsProviderConfig,
  declareCapabilities,
  type Facet,
  type QueryLocation,
  type SourceCapabilities,
  type SourcePage,
} from "@canonical/dataviews-core";
import type { TimelineFieldMapping } from "../src/lib/_work_in_progress/Timeline/index.js";
import createManualSource from "./createManualSource.js";
import { COUNTED_EXACTLY, countExactly } from "./fixtures.js";
import type { ManualSource, ManualSourceConfig } from "./types.js";

/** One activity record, as a source would deliver it. */
export type Activity = {
  readonly id: string;
  readonly at: string;
  readonly actor: string;
  readonly actorName: string;
  readonly kind: "approval" | "comment" | "push";
  readonly summary: string;
};

/** The activity collection every Timeline test mounts over. */
export const activities = createCollection({
  identify: (activity: Activity) => activity.id,
  fields: [
    { field: "at", kind: "date" },
    { field: "actor", kind: "choices" },
    { field: "actorName", kind: "text" },
    {
      field: "kind",
      kind: "choices",
      options: ["approval", "comment", "push"],
    },
    { field: "summary", kind: "text" },
  ],
});

/** The fields of the activity collection, for typed providers. */
export type ActivityFields = typeof activities.schema.fields;

/** The provider every Timeline test drives, over the activity collection. */
export type ActivityProvider = DataViewsProvider<ActivityFields, Activity>;

/** The mapping a timeline reads an activity through. */
export const ACTIVITY_MAPPING: TimelineFieldMapping = {
  dateTime: "at",
  actorId: "actor",
  actorName: "actorName",
  eventType: "kind",
  description: "summary",
};

/** One activity of the given identity, actor and kind, on the given day of June 2024. */
export const activity = (
  id: string,
  day: number,
  actor = "jane",
  kind: Activity["kind"] = "comment",
): Activity => ({
  id,
  at: `2024-06-${String(day).padStart(2, "0")}T09:00:00Z`,
  actor,
  actorName: actor === "jane" ? "Jane Doe" : "John Roe",
  kind,
  summary: `${kind} ${id}`,
});

/** A page of five activities, oldest first: two runs of Jane's, then John's. */
export const ACTIVITY_PAGE: readonly Activity[] = [
  activity("a-1", 1, "jane", "comment"),
  activity("a-2", 2, "jane", "comment"),
  activity("a-3", 3, "jane", "approval"),
  activity("a-4", 4, "john", "push"),
  activity("a-5", 5, "john", "push"),
];

const facetOf = (rows: readonly Activity[], field: "actor" | "kind"): Facet => {
  const counts = new Map<string, number>();
  for (const row of rows) {
    counts.set(row[field], (counts.get(row[field]) ?? 0) + 1);
  }
  return {
    kind: "values",
    values: [...counts].map(([value, count]) => ({
      value,
      count: countExactly(count),
    })),
  };
};

/** A page of activities, counted exactly, with the actor and kind facets they hold. */
export const pageOfActivities = (
  rows: readonly Activity[],
): SourcePage<Activity> =>
  createPage({
    rows,
    matched: rows.length,
    total: rows.length,
    facets: { actor: facetOf(rows, "actor"), kind: facetOf(rows, "kind") },
  });

/** What the fixture source declares: it filters by actor and kind, orders by date and facets both. */
export const ACTIVITY_CAPABILITIES: SourceCapabilities = declareCapabilities(
  activities,
  {
    filter: { actor: ["isAny"], kind: ["isAny"] },
    sort: { fields: ["at"], terms: 1, tiebreak: "opaque" },
    counts: COUNTED_EXACTLY,
    facets: ["actor", "kind"],
  } as const satisfies CapabilityDeclaration<ActivityFields>,
);

/** How one test's activity provider is set up. */
export type ActivityProviderConfig = Omit<
  ManualSourceConfig<Activity>,
  "capabilities"
> & {
  readonly capabilities?: SourceCapabilities | undefined;
  /** The rows every request is answered with at once; by hand when left out. */
  readonly rows?: readonly Activity[] | undefined;
  readonly location?: QueryLocation | undefined;
  /** The facets the provider asks for. Defaults to the actor and the kind. */
  readonly facets?:
    | DataViewsProviderConfig<ActivityFields, Activity>["facets"]
    | undefined;
  readonly snapshot?: DataViewsProviderConfig<
    ActivityFields,
    Activity
  >["snapshot"];
};

/** An activity provider over a manual source, with the source to answer it. */
export type ActivityFixture = {
  readonly provider: ActivityProvider;
  readonly collection: Collection<ActivityFields, Activity>;
  readonly source: ManualSource<Activity>;
};

/**
 * A provider over the activity collection and a manual source. Given `rows`,
 * every request is answered at once with them; otherwise the test delivers
 * through `source.latest().deliver(...)` after the timeline has observed the
 * provider.
 */
export const createActivityProvider = ({
  rows,
  capabilities = ACTIVITY_CAPABILITIES,
  location,
  facets = ["actor", "kind"],
  snapshot,
  ...rest
}: ActivityProviderConfig = {}): ActivityFixture => {
  const source = createManualSource<Activity>({
    ...rest,
    capabilities,
    ...(rows === undefined ? {} : { answer: () => pageOfActivities(rows) }),
  });
  const provider = createDataViewsProvider({
    collection: activities,
    source: source.source,
    facets,
    ...(location === undefined ? {} : { location }),
    ...(snapshot === undefined ? {} : { snapshot }),
  });
  return { provider, collection: activities, source };
};
