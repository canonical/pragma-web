import { useCallback, useMemo } from "react";
import type { DisplayField } from "../common/index.js";
import { areFieldScopesEqual, readFieldScopes } from "../utils/index.js";
import type { UseFieldScopesProps, UseFieldScopesResult } from "./types.js";
import useStableValue from "./useStableValue.js";

/**
 * What a renderer's declared fields know of record types: each one's scope,
 * read and checked once per list of what a scope is read from — so a heading
 * or content rebuilt inline re-reads none — and the decision whether one
 * applies to a record of one type. Rows and cards call the decision as they
 * render, so it is a callback over the scopes it reads, changing identity
 * with them and with nothing else, never a latest-value ref a render may
 * read from a render React discarded.
 */
export default function useFieldScopes({
  collection,
  fields,
  renderer,
}: UseFieldScopesProps): UseFieldScopesResult {
  const scoped = useStableValue(fields, areFieldScopesEqual);
  const readScope = useMemo(
    () => readFieldScopes({ collection, fields: scoped, renderer }),
    [collection, scoped, renderer],
  );
  const decideApplicability = useCallback(
    (field: DisplayField, type: string | null) =>
      readScope(field).applicability(type),
    [readScope],
  );
  return useMemo(
    () => ({ readScope, decideApplicability }),
    [readScope, decideApplicability],
  );
}
