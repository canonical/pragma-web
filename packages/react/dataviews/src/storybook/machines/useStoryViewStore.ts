import { createIndexedDBViewStore } from "@canonical/dataviews-core/indexeddb";
import { useEffect, useState } from "react";
import type { StoryViewStore, StoryViewStoreConfig } from "./types.js";

/**
 * A saved-view store of the story's own: the browser's IndexedDB, in a
 * database no other story or visit shares, seeded once and deleted when the
 * story unmounts. An application declares one store for its lifetime instead,
 * as the consumer code shows.
 *
 * @note Impure: names a random database, seeds it and deletes it on unmount.
 */
export default function useStoryViewStore({
  seed = [],
  indexedDB = globalThis.indexedDB,
}: StoryViewStoreConfig = {}): StoryViewStore {
  const [database] = useState(
    () => `dataviews-story-views-${Math.random().toString(36).slice(2)}`,
  );
  const [setUp] = useState(() => {
    const scope = {
      indexedDB,
      database,
      collection: "machines",
      partition: null,
    };
    return {
      store: createIndexedDBViewStore(scope),
      openAnotherTab: () => createIndexedDBViewStore(scope),
      seed,
    };
  });
  useEffect(() => {
    for (const draft of setUp.seed) {
      // Storage the browser refuses is the control's to report.
      setUp.store.create(draft).catch(() => {});
    }
    // The store closes its connection when the database is deleted.
    return () => {
      globalThis.indexedDB?.deleteDatabase(database);
    };
  }, [setUp, database]);
  return setUp;
}
