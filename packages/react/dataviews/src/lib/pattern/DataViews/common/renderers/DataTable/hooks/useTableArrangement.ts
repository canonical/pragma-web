import { createMemoryPresentation } from "@canonical/dataviews-core/bindings";
import { useState } from "react";
import type {
  UseTableArrangementProps,
  UseTableArrangementResult,
} from "./types.js";

/** The name a table without an id keeps its own arrangement under. */
const UNNAMED_TABLE = "table";

/** A UTF-16 surrogate with no partner, which no key can spell. */
const LONE_SURROGATE = /\p{Surrogate}/u;

/**
 * Where one table keeps its arrangement: under its id in the provider's
 * presentation, or, without one, in its own for the mount.
 */
export default function useTableArrangement(
  ...[provider, hasSettings, { id } = {}]: UseTableArrangementProps
): UseTableArrangementResult {
  // Any well-formed id is spelled into the keys; an empty one names nothing.
  const named = id === "" ? undefined : id;
  if (hasSettings && named === undefined) {
    throw new Error(
      "DataTable takes an id with settings: its settings are kept under it",
    );
  }
  // A lone surrogate cannot be URI-encoded, so it can name no key.
  if (named !== undefined && LONE_SURROGATE.test(named)) {
    throw new Error(
      "DataTable takes a well-formed id: a lone surrogate names no key",
    );
  }
  // Built once per mount, and read only while the table has no id.
  const [own] = useState(createMemoryPresentation);
  return named === undefined
    ? { table: UNNAMED_TABLE, presentation: own, shared: false }
    : { table: named, presentation: provider.presentation, shared: true };
}
