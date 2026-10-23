/**
 * The route content's own contract: BOTH addresses mount this page — the
 * term-less `/definitions` renders the whole explorer with an honestly
 * empty inspector (no default term, no redirect), and the h1 marker stays
 * outside the boundaries so it stands even while the interior suspends.
 */

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import createDefinitionsPage from "../../../../testing/createDefinitionsPage.js";
import createFetchSpy from "../../../../testing/createFetchSpy.js";
import {
  DEFINITIONS_TEST_TIMEOUT_MS,
  UIBLOCK_TERM,
} from "../../../../testing/fixtures.js";
import definitionsExplorerRecords from "../../../../testing/records/definitionsExplorerRecords.js";

describe("DefinitionsPage at /definitions (no term)", () => {
  it("renders the full explorer with nothing selected, no fetch", {
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
    // Nothing is selected: no class is ringed, no link is current.
    expect(document.querySelector(".ring")).toBeNull();
    expect(screen.queryByRole("link", { current: "page" })).toBeNull();
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

describe("DefinitionsPage's document title", () => {
  it("names the lens on the explorer and the term on a term view", {
    timeout: DEFINITIONS_TEST_TIMEOUT_MS,
  }, () => {
    const explorer = render(
      createDefinitionsPage(
        undefined,
        definitionsExplorerRecords,
        createFetchSpy(),
      ),
    );
    expect(document.querySelector("title")?.textContent).toBe("Definitions");
    explorer.unmount();

    render(
      createDefinitionsPage(
        UIBLOCK_TERM,
        definitionsExplorerRecords,
        createFetchSpy(),
      ),
    );
    expect(document.querySelector("title")?.textContent).toBe(
      "ds:UIBlock — Definitions",
    );
  });
});

describe("DefinitionsPage's root", () => {
  it("labels its section by its heading, and keeps the router's search off it", () => {
    render(
      createDefinitionsPage(
        undefined,
        definitionsExplorerRecords,
        createFetchSpy(),
      ),
    );
    const section = screen.getByRole("region", { name: "Definitions" });
    expect(section.className).toBe("ds definitions-page");
    expect(section).not.toHaveAttribute("search");
  });
});
