/**
 * The activity collection the Timeline stories share: a review log of a
 * merge proposal, its collection and mapping, and sources answering it at
 * once, never, with a failure, or with nothing.
 */

import {
  createArraySource,
  createCollection,
  createDataViewsProvider,
  type DataViewsProvider,
  type QueryLocation,
  type Source,
} from "@canonical/dataviews-core";
import { useState } from "react";
import type { TimelineFieldMapping } from "../../lib/_work_in_progress/Timeline/index.js";

/** One activity of the review log. */
export type Activity = {
  readonly id: string;
  readonly at: string;
  readonly actor: string;
  readonly actorName: string;
  readonly kind: "approval" | "comment" | "push" | "rejection";
  readonly summary: string;
};

/** The review log's collection. */
export const activityCollection = createCollection({
  identify: (activity: Activity) => activity.id,
  fields: [
    { field: "at", kind: "date" },
    { field: "actor", kind: "choices" },
    { field: "actorName", kind: "text" },
    {
      field: "kind",
      kind: "choices",
      options: ["approval", "comment", "push", "rejection"],
    },
    { field: "summary", kind: "text" },
  ],
});

export type ActivityFields = typeof activityCollection.schema.fields;

export type ActivityProvider = DataViewsProvider<ActivityFields, Activity>;

/** How a timeline reads an activity. */
export const activityMapping: TimelineFieldMapping = {
  dateTime: "at",
  actorId: "actor",
  actorName: "actorName",
  eventType: "kind",
  description: "summary",
};

/** The names the timeline's controls give the review log's actor and event type. */
export const activityLabels = {
  actorFilterLabel: "Reviewer",
  eventFilterLabel: "Activity",
} as const;

const PEOPLE = [
  ["ana", "Ana Lima"],
  ["ben", "Ben Okafor"],
  ["chen", "Chen Wei"],
] as const;

const KINDS = ["push", "comment", "comment", "approval", "rejection"] as const;

const SAID = {
  push: "Pushed",
  comment: "Commented on",
  approval: "Approved",
  rejection: "Rejected",
} as const;

/** Twenty-four activities, one every five hours from a fixed start, in runs of one reviewer. */
export const activityRows: readonly Activity[] = Array.from(
  { length: 24 },
  (_unused, at) => {
    const [actor, actorName] = PEOPLE[Math.floor(at / 3) % PEOPLE.length] ?? [
      "ana",
      "Ana Lima",
    ];
    const kind = KINDS[at % KINDS.length] ?? "comment";
    return {
      id: `activity-${String(at + 1).padStart(2, "0")}`,
      at: new Date(Date.UTC(2026, 8, 1, 9) + at * 5 * 3_600_000).toISOString(),
      actor,
      actorName,
      kind,
      summary: `${SAID[kind]} revision ${Math.floor(at / 4) + 1}`,
    };
  },
);

/** A source over the review log, answering at once, ordering by date and faceting reviewer and activity. */
export const createActivitySource = (
  rows: readonly Activity[] = activityRows,
): Source<Activity> =>
  createArraySource({
    rows,
    collection: activityCollection,
    defaultSort: [{ field: "at", direction: "desc" }],
  });

/** A source that never answers. */
export const createPendingActivitySource = (): Source<Activity> => ({
  ...createActivitySource(),
  execute: () => () => undefined,
});

/** A source failing every request: the review log cannot be reached. */
export const createFailingActivitySource = (): Source<Activity> => ({
  ...createActivitySource(),
  execute: (_request, deliver) => {
    deliver({
      status: "failed",
      failure: {
        reason: "the review log could not be reached",
        cause: null,
        transient: null,
      },
    });
    return () => undefined;
  },
});

/** How a story's provider is built. */
export type ActivityProviderConfig = {
  readonly source?: () => Source<Activity>;
  readonly location?: QueryLocation;
};

/** One provider over the review log, built once for the story. */
export function useActivityProvider({
  source = createActivitySource,
  location,
}: ActivityProviderConfig = {}): ActivityProvider {
  const [provider] = useState(() =>
    createDataViewsProvider({
      collection: activityCollection,
      source: source(),
      facets: ["actor", "kind"],
      ...(location === undefined ? {} : { location }),
    }),
  );
  return provider;
}
