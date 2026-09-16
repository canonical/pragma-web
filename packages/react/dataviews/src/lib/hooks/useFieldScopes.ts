import { useMemo } from "react";
import type { DisplayField } from "../common/index.js";
import { areFieldScopesEqual, readFieldScopes } from "../utils/index.js";
import type { UseFieldScopesProps, UseFieldScopesResult } from "./types.js";
import useStableCallback from "./useStableCallback.js";
import useStableValue from "./useStableValue.js";

/**
 * What a renderer's declared fields know of record types: each one's scope,
 * read and checked once per list of what a scope is read from — so a heading
 * or content rebuilt inline re-reads none — and the decision whether one
 * applies to a record of one type, held at one identity for every row or
 * card.
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
  const decideApplicability = useStableCallback(
    (field: DisplayField, type: string | null) =>
      readScope(field).applicability(type),
  );
  return useMemo(
    () => ({ readScope, decideApplicability }),
    [readScope, decideApplicability],
  );
}
