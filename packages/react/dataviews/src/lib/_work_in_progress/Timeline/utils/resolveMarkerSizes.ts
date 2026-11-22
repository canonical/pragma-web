import type {
  TimelineItem,
  TimelineMarkerCombination,
  TimelineMarkerSize,
} from "../types.js";

type SizedItem = Pick<TimelineItem, "actorId" | "eventType" | "marker">;

/** One event, with the size its marker is drawn at. */
export type SizedEvent<TItem> = {
  readonly item: TItem;
  readonly size: TimelineMarkerSize;
};

const sizeFor = (
  combination: TimelineMarkerCombination,
  opensActorRun: boolean,
  opensTypeRun: boolean,
): TimelineMarkerSize => {
  switch (combination) {
    case "large":
    case "medium":
    case "small":
      return combination;
    case "large-medium":
      return opensActorRun ? "large" : "medium";
    case "large-small":
      return opensActorRun ? "large" : "small";
    case "medium-small":
      return opensActorRun ? "medium" : "small";
    case "all-sizes":
      if (opensActorRun) {
        return "large";
      }
      return opensTypeRun ? "medium" : "small";
  }
};

/**
 * Each event with its marker's size, in order: from the combination's rules over runs
 * of one actor and of one event type, unless the event's marker names its
 * own size. An event without an actor ends the actor's run, and an actor's
 * run restarts the count of type runs.
 */
export default function resolveMarkerSizes<TItem extends SizedItem>(
  items: readonly TItem[],
  combination: TimelineMarkerCombination,
): SizedEvent<TItem>[] {
  let actor: string | undefined;
  let type: string | undefined;
  return items.map((item) => {
    const opensActorRun = item.actorId !== undefined && item.actorId !== actor;
    actor = item.actorId;
    let opensTypeRun = false;
    if (opensActorRun) {
      type = undefined;
    } else {
      opensTypeRun = item.eventType !== undefined && item.eventType !== type;
      type = item.eventType;
    }
    return {
      item,
      size:
        item.marker?.size ?? sizeFor(combination, opensActorRun, opensTypeRun),
    };
  });
}
