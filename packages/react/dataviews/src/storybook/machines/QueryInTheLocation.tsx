import type { QueryLocation } from "@canonical/dataviews-core";
import { type ReactElement, useSyncExternalStore } from "react";

/** The query a location carries, shown the way an address bar would. */
export default function QueryInTheLocation({
  location,
}: {
  readonly location: QueryLocation;
}): ReactElement {
  const query = useSyncExternalStore(location.subscribe, () =>
    location.read().toString(),
  );
  return (
    <p>
      <output aria-label="Location">{`/machines?${query}`}</output>
    </p>
  );
}
