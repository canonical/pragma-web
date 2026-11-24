import type {
  RowRecord,
  SchemaFieldDefinition,
} from "@canonical/dataviews-core";
import {
  assertInvariant,
  readProviderHost,
} from "@canonical/dataviews-core/bindings";
import { useLayoutEffect, useState } from "react";
import { TABBABLE_ATTRIBUTES } from "../common/constants.js";
import { hasTabbableDescendant } from "../common/utils/index.js";
import type { UseTabStopProps, UseTabStopResult } from "./types.js";

/**
 * The table's tab index: 0 where Tab reaches nothing inside, so a keyboard
 * still scrolls it, and -1 otherwise, so a focused table keeps focus.
 * Before scripts it counts the links the table itself draws; once
 * committed it reads the markup, and again on each change to it.
 *
 * @note Impure: observes the committed table until unmount.
 */
export default function useTabStop<
  TFields extends readonly SchemaFieldDefinition[],
  TRow extends object = RowRecord,
>({
  provider,
  headerRow,
  columns,
  isSortable,
  arranged,
}: UseTabStopProps<TFields, TRow>): UseTabStopResult {
  // Before scripts run only links take focus: a sort's and the settings',
  // which lead somewhere only with a location. A column's own content is
  // not guessed: a wrong guess there costs one tab stop, not the scroll.
  const hasLinksBeforeScripts = (): boolean =>
    readProviderHost(provider).location !== null &&
    (arranged || columns.some(isSortable));
  const [measured, setMeasured] = useState<boolean | null>(null);
  useLayoutEffect(() => {
    const table = assertInvariant(
      headerRow.current?.closest("table"),
      "a committed table around its header row",
    );
    const measure = (): void => setMeasured(hasTabbableDescendant(table));
    measure();
    const observer = new MutationObserver(measure);
    observer.observe(table, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: [...TABBABLE_ATTRIBUTES],
    });
    return () => observer.disconnect();
  }, [headerRow]);
  return (measured ?? hasLinksBeforeScripts()) ? -1 : 0;
}
