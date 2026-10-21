/**
 * The route content's own contract: BOTH addresses mount this page — the
 * term-less `/definitions` renders the whole explorer with an honestly
 * empty inspector (no default term, no redirect), and the h1 marker stays
 * outside the boundaries so it stands even while the interior suspends.
 */

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import createDefinitionsPage from "../../../testing/createDefinitionsPage.js";
import createFetchSpy from "../../../testing/createFetchSpy.js";
import { DEFINITIONS_TEST_TIMEOUT_MS } from "../../../testing/fixtures.js";
import definitionsExplorerRecords from "../../../testing/records/definitionsExplorerRecords.js";

describe("DefinitionsPage at /definitions (no term)", () => {
  it("renders the full explorer with the empty inspector, no fetch", {
    timeout: DEFINITIONS_TEST_TIMEOUT_MS,
  }, () => {
    // The captured term fixture is a superset of the term-less operation's
    // data (`ontologies` is the same root field), so the store fulfils
    // { uri: "", hasTerm: false } too — same records, both addresses.
    const fetchFn = createFetchSpy();
    render(
      createDefinitionsPage(undefined, definitionsExplorerRecords, fetchFn),
    );

    expect(
      screen.getByRole("heading", { level: 1, name: "Definitions" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("navigation", { name: "Ontology terms" }),
    ).toBeInTheDocument();
    // The honest empty state — an invitation, never an alert.
    expect(screen.getByText(/Select a term/)).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(fetchFn).not.toHaveBeenCalled();
  });

  it("has teeth: a cold store suspends the interior and fetches once", {
    timeout: DEFINITIONS_TEST_TIMEOUT_MS,
  }, () => {
    const fetchFn = createFetchSpy();
    render(createDefinitionsPage(undefined, undefined, fetchFn));

    expect(screen.getByText("Loading the ontologies…")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 1, name: "Definitions" }),
    ).toBeInTheDocument();
    expect(fetchFn).toHaveBeenCalledTimes(1);
  });
});
