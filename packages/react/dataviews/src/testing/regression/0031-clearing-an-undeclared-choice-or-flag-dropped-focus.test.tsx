/**
 * Regression: clearing an undeclared choice or presence filter keeps focus
 * on a control.
 *
 * Before the fix, a set of choices or a presence filter the source does not
 * declare was shown only while it stood, for removal, so unchecking its last
 * checkbox unmounted the whole control while that checkbox had focus, and
 * focus fell to the document. Focus now moves to the filters' group, as it
 * does when undeclared text or an undeclared bound is cleared; a presence
 * filter, whose radios arrow keys choose as they reach them, stays while
 * focus is inside it and leaves once focus does.
 */

import {
  createCollection,
  createDataViewsProvider,
  DEFAULT_WINDOW,
  declareCapabilities,
  EMPTY_SLICE,
  type Predicate,
  type SourceCapabilities,
} from "@canonical/dataviews-core";
import { readProviderHost } from "@canonical/dataviews-core/bindings";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import createManualSource from "../../../testing/createManualSource.js";
import { DataViews } from "../../lib/_work_in_progress/DataViews/index.js";

type Row = {
  readonly id: string;
  readonly status: string;
  readonly spare: boolean;
};

const collection = createCollection({
  identify: (row: Row) => row.id,
  fields: [
    { field: "status", kind: "choices", options: ["ready", "failed"] },
    { field: "spare", kind: "presence" },
  ],
});

/** What a source declaring nothing offers. */
const UNDECLARED = declareCapabilities(collection, {});

/** What a source declaring both fields offers. */
const DECLARED = declareCapabilities(collection, {
  filter: { status: ["isAny"], spare: ["isSet"] },
});

/** Filters over a source, with one predicate standing. */
const renderStanding = (
  predicate: Predicate,
  capabilities: SourceCapabilities = UNDECLARED,
): void => {
  const provider = createDataViewsProvider({
    collection,
    source: createManualSource<Row>({ capabilities }).source,
  });
  render(
    <DataViews provider={provider}>
      <DataViews.Filters />
    </DataViews>,
  );
  act(() => {
    readProviderHost(provider).adopt(
      {
        slice: { ...EMPTY_SLICE, filter: [predicate] },
        window: DEFAULT_WINDOW,
      },
      "adopt",
      null,
    );
  });
};

describe("regression 0031 — clearing an undeclared choice or flag dropped focus", () => {
  it("moves focus to the filters' group when the last choice is unchecked", () => {
    renderStanding({
      field: "status",
      operator: "isAny",
      operands: ["failed"],
    });
    const failed = screen.getByRole("checkbox", { name: "failed" });
    failed.focus();
    fireEvent.click(failed);
    expect(screen.queryByRole("checkbox", { name: "failed" })).toBeNull();
    expect(screen.getByRole("group", { name: "Filters" })).toHaveFocus();
  });

  it("keeps focus on the presence filter it clears, which leaves once focus does", () => {
    renderStanding({ field: "spare", operator: "isSet", operands: [true] });
    const any = screen.getByRole("radio", { name: "Any" });
    act(() => {
      any.focus();
    });
    fireEvent.click(any);
    // Arrow keys choose each radio they reach: the group stays under them.
    expect(any).toHaveFocus();
    expect(screen.getByRole("group", { name: "spare" })).toBeInTheDocument();
    act(() => {
      screen.getByRole("group", { name: "Filters" }).focus();
    });
    expect(screen.queryByRole("group", { name: "spare" })).toBeNull();
  });

  it("keeps focus on a declared choice, which stays to be checked again", () => {
    renderStanding(
      { field: "status", operator: "isAny", operands: ["failed"] },
      DECLARED,
    );
    const failed = screen.getByRole("checkbox", { name: "failed" });
    failed.focus();
    fireEvent.click(failed);
    expect(failed).not.toBeChecked();
    expect(failed).toHaveFocus();
  });

  it("keeps focus on a declared presence filter, which stays to be set again", () => {
    renderStanding(
      { field: "spare", operator: "isSet", operands: [true] },
      DECLARED,
    );
    const any = screen.getByRole("radio", { name: "Any" });
    any.focus();
    fireEvent.click(any);
    expect(
      screen.getByRole("radio", { name: "Has a value" }),
    ).not.toBeChecked();
    expect(any).toHaveFocus();
  });
});
