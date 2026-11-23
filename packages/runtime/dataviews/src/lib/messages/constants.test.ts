import { describe, expect, it } from "vitest";
import {
  DIRECTIONS,
  DEFAULT_MESSAGES as m,
  NOT_DONE,
  PENDING,
  STILL_APPLIES,
} from "./constants.js";

const buildExact = (value: number) => ({ kind: "exact", value }) as const;
const buildAtLeast = (value: number) => ({ kind: "at-least", value }) as const;
const unknown = { kind: "unknown" } as const;

describe("constants", () => {
  describe("DEFAULT_MESSAGES", () => {
    it("words an ordering from terms already worded", () => {
      expect(m.sortApplied(["Name, descending"])).toBe(
        "Sorted by Name, descending.",
      );
    });

    it("ends each status with a full stop, and a blank reason plainly", () => {
      expect(m.statusRefreshFailed(" . ")).toBe(
        "These rows could not be refreshed.",
      );
      expect(m.statusStale("")).toBe(
        "These rows do not match the current query.",
      );
    });

    it("words the table's status row", () => {
      expect(m.statusPending).toBe("Loading…");
      expect(m.statusFailed("timeout")).toBe(
        "These rows could not be loaded: timeout.",
      );
      expect(m.statusRefreshFailed("timeout")).toBe(
        "These rows could not be refreshed: timeout.",
      );
      expect(m.statusStale("offline")).toBe(
        "These rows do not match the current query: offline.",
      );
      expect(m.statusNoResults).toBe("No rows match this query.");
      expect(m.statusNoData).toBe("There is nothing here yet.");
      expect(m.statusNoAccess).toBe(
        "You do not have permission to see these rows.",
      );
      expect(m.statusRefused('"melted" is not an option')).toBe(
        'This link could not be followed: "melted" is not an option.',
      );
      expect(m.statusRefused(" . ")).toBe("This link could not be followed.");
    });

    it("words a followed link's refused clauses as a list of them", () => {
      expect(m.linkRefusals).toBe("Not applied from the link");
      expect(
        m.clauseRefused({
          name: "Status",
          reason: '"melted" is not an option.',
        }),
      ).toBe('Status: "melted" is not an option.');
      expect(m.grouping).toBe("Grouping");
    });

    it("words the table's selection and resize controls, with the width's plural", () => {
      expect(m.selectAllRows).toBe("Select all displayed rows");
      expect(m.selectRow("alder")).toBe("Select alder");
      expect(m.columnWidth(1)).toBe("1 pixel");
      expect(m.columnWidth(120)).toBe("120 pixels");
      expect(m.columnEndPlacement("Name")).toBe(
        "Click or tap in the header row where the Name column should end. Press the edge again or Escape to cancel.",
      );
    });

    it("words a sort's precedence with an English ordinal once there are two terms", () => {
      expect(
        m.sortPrecedence({ direction: "asc", position: 1, total: 1 }),
      ).toBe("ascending");
      expect(
        m.sortPrecedence({ direction: "desc", position: 2, total: 3 }),
      ).toBe("descending, 2nd of 3");
      expect(
        m.sortPrecedence({ direction: "asc", position: 11, total: 12 }),
      ).toBe("ascending, 11th of 12");
    });

    it("words a refused sort with one full stop, whatever the source ended with", () => {
      expect(m.sortRefused(["this source orders by at most 1 term"])).toBe(
        "Sort unchanged: this source orders by at most 1 term.",
      );
      expect(m.sortRefused(["this source orders by at most 1 term."])).toBe(
        "Sort unchanged: this source orders by at most 1 term.",
      );
    });

    it("says a sort is unchanged where the source gave no reason worth saying", () => {
      expect(m.sortRefused([])).toBe("Sort unchanged.");
      expect(m.sortRefused(["  ", "."])).toBe("Sort unchanged.");
    });

    it("drops a blank reason rather than writing a bare stop", () => {
      expect(
        m.filterRefused({ reasons: ["", "not a number"], retained: false }),
      ).toBe("Not a number.");
      expect(m.filterRefused({ reasons: [" "], retained: false })).toBe("");
      const retained = m.filterRefused({ reasons: ["  "], retained: true });
      expect(retained.startsWith(" ")).toBe(false);
      expect(retained).not.toContain("..");
    });

    it("words every reason a source refused an ordering for", () => {
      expect(m.sortRefused(["no such field", "at most 1 term"])).toBe(
        "Sort unchanged: no such field; at most 1 term.",
      );
    });

    it("runs a status on from its reason, stripped of the stop it came with", () => {
      expect(m.statusFailed("timeout.")).toBe(
        "These rows could not be loaded: timeout.",
      );
      expect(m.statusRefreshFailed("timeout.")).toBe(
        "These rows could not be refreshed: timeout.",
      );
      expect(m.statusStale("offline.")).toBe(
        "These rows do not match the current query: offline.",
      );
    });

    it("words an ordering, the reader's and the source's", () => {
      const terms = [
        m.sortTerm({ name: "Name", direction: "asc" }),
        m.sortTerm({ name: "Cores", direction: "desc" }),
      ];
      expect(m.sortApplied(terms)).toBe(
        "Sorted by Name, ascending; then Cores, descending.",
      );
      expect(m.sortDefaulted(terms)).toBe(
        "Sorted by the source's own order: Name, ascending; Cores, descending.",
      );
      expect(m.sortAbsent).toBe("Not sorted: the source documents no order.");
      expect(m.sortTerm({ name: "name", direction: "desc" })).toBe(
        "name, descending",
      );
    });

    it("words a column's header menu and the table's settings menu", () => {
      expect(m.columnOptions("Status")).toBe("Column options for Status");
      expect([
        m.sortAscending,
        m.sortDescending,
        m.removeFromSort,
        m.hideColumn,
        m.moveColumnLeft,
        m.moveColumnRight,
      ]).toEqual([
        "Sort ascending",
        "Sort descending",
        "Remove from sort",
        "Hide column",
        "Move column left",
        "Move column right",
      ]);
      expect(m.tableSettings).toBe("Table settings");
      expect(m.hideNamedColumn("Status")).toBe("Hide Status");
      expect(m.showNamedColumn("Status")).toBe("Show Status");
      expect(m.moveNamedColumnLeft("Status")).toBe("Move Status left");
      expect(m.moveNamedColumnRight("Status")).toBe("Move Status right");
      expect(m.columnAlwaysShown("Name")).toBe("Name is always shown");
      expect(m.resetTableSettings).toBe("Reset table settings");
    });

    it("words what a change to the columns announces, with its place", () => {
      expect(m.columnHidden("Status")).toBe("Status hidden");
      expect(m.columnShown({ name: "Status", position: 2, total: 3 })).toBe(
        "Status shown, position 2 of 3",
      );
      expect(m.columnMoved({ name: "Status", position: 1, total: 3 })).toBe(
        "Status moved to position 1 of 3",
      );
      expect(m.tableSettingsReset).toBe("Table settings reset");
    });

    it("words the sort panel's controls", () => {
      expect([
        m.sortPanel,
        m.moveSortTermUp,
        m.moveSortTermDown,
        m.removeSortTerm,
      ]).toEqual(["Sort", "Move up", "Move down", "Remove"]);
    });

    it("words the filters' controls and hints", () => {
      expect([m.filters, m.moreFilters, m.submitFilters]).toEqual([
        "Filters",
        "More filters",
        "Apply filters",
      ]);
      expect(m.filterFrom("Cores")).toBe("Cores from");
      expect(m.filterTo("Cores")).toBe("Cores to");
      expect(m.filterLowest("2")).toBe("Lowest: 2");
      expect(m.filterHighest("64")).toBe("Highest: 64");
      expect(m.clearFilter("Cores from")).toBe("Clear Cores from");
      expect(m.filterIsAnyOf("Status")).toBe("Status is any of");
      expect(m.filterIsNoneOf("Status")).toBe("Status is none of");
      expect(m.matchAnyInstead).toBe("Match any of these instead");
      expect(m.matchNoneInstead).toBe("Match none of these instead");
      expect(m.facetCount(buildExact(12))).toBe("12");
      expect(m.facetCount(buildAtLeast(1000))).toBe("at least 1,000");
      expect(m.filterContains("Name")).toBe("Name contains");
      expect(
        m.filterAlso({
          phrase: "Tags is any of",
          values: ["ex-gpu", "ex-nvme"],
        }),
      ).toBe("Tags is any of ex-gpu, ex-nvme");
      expect(m.filterStartsWith("Name")).toBe("Name starts with");
    });

    it("words why a filter edit did not apply, and whether the earlier restriction stands", () => {
      expect(m.filterIncomplete(false)).toBe(
        "Enter a value to apply this restriction.",
      );
      expect(m.filterIncomplete(true)).toBe(
        "Enter a value to change this restriction. The previous restriction still applies.",
      );
      // One message for every refusal, whether the schema gave one reason or
      // the source gave several.
      expect(
        m.filterRefused({ reasons: ["not a number"], retained: false }),
      ).toBe("Not a number.");
      expect(
        m.filterRefused({ reasons: ["not a number"], retained: true }),
      ).toBe("Not a number. The previous restriction still applies.");
      expect(
        m.filterRefused({
          reasons: ["no bounds here", "no ranges"],
          retained: false,
        }),
      ).toBe("No bounds here. No ranges.");
    });

    it("words the search", () => {
      expect([m.search, m.submitSearch]).toEqual(["Search", "Search"]);
    });

    it("words the pagination bar, counting rows rather than items, with no colon in a name", () => {
      expect([
        m.pagination,
        m.rowsPerPage,
        m.submitPageSize,
        m.page,
        m.submitPage,
        m.goToFirstPage,
        m.goToPreviousPage,
        m.goToNextPage,
        m.goToLastPage,
      ]).toEqual([
        "Pagination",
        "Rows per page",
        "Apply page size",
        "Page",
        "Go to page",
        "First page",
        "Previous page",
        "Next page",
        "Last page",
      ]);
      expect(m.pageCount(1)).toBe("of 1 page");
      expect(m.pageCount(4)).toBe("of 4 pages");
    });

    it("words which rows are on screen, as exactly as the source counts them", () => {
      expect(m.rowsShown({ first: 6, shown: 5, total: buildExact(12) })).toBe(
        "Showing 6–10 out of 12 rows",
      );
      expect(m.rowsShown({ first: 1, shown: 0, total: buildExact(0) })).toBe(
        "Showing 0 out of 0 rows",
      );
      expect(m.rowsShown({ first: 6, shown: 1, total: buildExact(6) })).toBe(
        "Showing row 6 out of 6",
      );
      expect(
        m.rowsShown({ first: 1, shown: 5, total: buildAtLeast(100) }),
      ).toBe("Showing 1–5 out of at least 100 rows");
      expect(m.rowsShown({ first: 3, shown: 1, total: buildAtLeast(3) })).toBe(
        "Showing row 3 out of at least 3",
      );
      expect(m.rowsShown({ first: 1, shown: 5, total: unknown })).toBe(
        "Showing 1–5 rows",
      );
      expect(m.rowsShown({ first: 2, shown: 1, total: unknown })).toBe(
        "Showing row 2",
      );
      expect(m.rowsShown({ first: 1, shown: 1, total: buildExact(1) })).toBe(
        "Showing row 1 out of 1",
      );
    });

    it("groups a large count as English writes it", () => {
      expect(
        m.rowsShown({ first: 1, shown: 50, total: buildExact(12345) }),
      ).toBe("Showing 1–50 out of 12,345 rows");
      expect(m.pageCount(1200)).toBe("of 1,200 pages");
      expect(m.rowsSelected(2500)).toBe("2,500 selected");
      expect(m.columnWidth(1024)).toBe("1,024 pixels");
    });

    it("words the saved views' controls and notices", () => {
      expect([
        m.savedViews,
        m.viewsUnscripted,
        m.view,
        m.viewNone,
        m.viewModified,
        m.saveView,
        m.overwriteView,
        m.revertView,
        m.discardViewChanges,
        m.saveViewAs,
        m.renameView,
        m.deleteView,
        m.refreshViews,
        m.saveAsForm,
        m.submitSaveAs,
        m.submitRename,
        m.viewName,
        m.cancel,
        m.submitDelete,
        m.viewsPending,
      ]).toEqual([
        "Saved views",
        "Saved views need JavaScript. A link to a query still works.",
        "View",
        "No saved view",
        "Modified",
        "Save",
        "Overwrite",
        "Revert",
        "Discard changes",
        "Save as…",
        "Rename…",
        "Delete…",
        "Try again",
        "Save as a new view",
        "Save view",
        "Rename",
        "Name",
        "Cancel",
        "Delete view",
        "Loading saved views…",
      ]);
      expect(m.renameForm("Busy")).toBe('Rename "Busy"');
      expect(m.deleteForm("Busy")).toBe(
        'Delete "Busy"? This cannot be undone.',
      );
      expect(m.viewsUnavailable("blocked")).toBe(
        "Saved views are unavailable: blocked.",
      );
      expect(m.viewsUnreadable(1)).toBe("1 saved view cannot be read.");
      expect(m.viewsUnreadable(2)).toBe("2 saved views cannot be read.");
      expect(m.presentationUnsaved("quota")).toBe(
        "The arrangement is not being saved: quota.",
      );
      expect(m.viewNameRefused("name is taken")).toBe("Name is taken.");
    });

    it("ends a reason with one full stop, whatever the store ended it with", () => {
      expect(m.viewsUnavailable("blocked.")).toBe(
        "Saved views are unavailable: blocked.",
      );
      expect(m.presentationUnsaved("quota.")).toBe(
        "The arrangement is not being saved: quota.",
      );
      expect(m.viewFailed({ command: "save", reason: "quota exceeded." })).toBe(
        "Not saved: quota exceeded.",
      );
      expect(m.viewUnreadable({ command: "open", reason: "bad json." })).toBe(
        "Not opened: the stored view cannot be read (bad json).",
      );
      expect(m.viewNameRefused("name is taken.")).toBe("Name is taken.");
      expect(m.viewRefused({ name: "Busy", reasons: ["no field."] })).toBe(
        'Not opened: "Busy" asks for what this collection cannot show — no field. The query is unchanged.',
      );
    });

    it("words every saved-view command's progress and outcome", () => {
      expect(
        (["open", "save", "save-as", "rename", "remove"] as const).map(
          m.viewPending,
        ),
      ).toEqual([
        "Opening the view…",
        "Saving…",
        "Saving…",
        "Renaming…",
        "Deleting…",
      ]);
      expect(m.viewOpened("Busy")).toBe('Opened "Busy".');
      expect(m.viewSaved("Busy")).toBe('Saved "Busy".');
      expect(m.viewRenamed("Idle")).toBe('Renamed to "Idle".');
      expect(m.viewDeleted).toBe("View deleted.");
      expect(
        m.viewRefused({ name: "Busy", reasons: ["no field", "no operator"] }),
      ).toBe(
        'Not opened: "Busy" asks for what this collection cannot show — no field; no operator. The query is unchanged.',
      );
      expect(m.viewConflicted({ command: "save", name: "Busy" })).toBe(
        'Not saved: "Busy" was changed elsewhere. Overwrite it, save your changes as a new view, or discard them.',
      );
      expect(m.viewConflicted({ command: "save-as", name: "" })).toBe(
        "Not saved: a different view is stored under the same identity. Try again.",
      );
      expect(m.viewConflicted({ command: "rename", name: "Busy" })).toBe(
        'Not renamed: "Busy" was changed elsewhere. Its latest version is open; try again.',
      );
      expect(m.viewMissing("remove")).toBe(
        "Not deleted: the view no longer exists.",
      );
      expect(m.viewUnreadable({ command: "open", reason: "bad json" })).toBe(
        "Not opened: the stored view cannot be read (bad json).",
      );
      expect(m.viewFailed({ command: "save", reason: "quota" })).toBe(
        "Not saved: quota.",
      );
    });

    it("words the facet charts, naming each drawing by its caption", () => {
      expect(m.facetCountsAbsent).toBe(
        "The source answered no counts for this field.",
      );
      expect(m.facetRangeAbsent).toBe(
        "The source answered no range for this field.",
      );
      expect(m.facetValuesNone).toBe("No matching record holds a value.");
      expect(m.barChartSummary("Machines by status")).toBe(
        "Machines by status: a bar chart of how many records hold each value",
      );
      expect(m.rangeChartSummary({ label: "Cores", min: 3, max: 12 })).toBe(
        "Cores: a range chart from 3 to 12",
      );
      expect(m.chartTable("Cores")).toBe("Cores, as a table");
      expect([
        m.chartValue,
        m.chartCount,
        m.countUnknown,
        m.chartLowest,
        m.chartHighest,
      ]).toEqual(["Value", "Count", "Not counted", "Lowest", "Highest"]);
    });

    it("words the renderer switch", () => {
      expect(m.renderer).toBe("Show as");
    });

    it("names the chart and the table a switch offers", () => {
      expect([m.chartRenderer, m.tableRenderer]).toEqual(["Chart", "Table"]);
    });

    it("words the action bar, counting rows", () => {
      expect(m.actionBar).toBe("Selection actions");
      expect(m.rowsSelected(3)).toBe("3 selected");
      expect(m.clearSelection(1)).toBe("Deselect 1 row");
      expect(m.clearSelection(3)).toBe("Deselect 3 rows");
    });
  });

  describe("DIRECTIONS", () => {
    it("reads each direction as English words it", () => {
      expect(DIRECTIONS).toEqual({ asc: "ascending", desc: "descending" });
    });
  });

  describe("NOT_DONE and PENDING", () => {
    it("say what each saved-view command did not do, or is doing", () => {
      expect(NOT_DONE.remove).toBe("Not deleted");
      expect(PENDING["save-as"]).toBe("Saving…");
      expect(Object.keys(NOT_DONE)).toEqual(Object.keys(PENDING));
    });
  });

  describe("STILL_APPLIES", () => {
    it("says the earlier restriction stands", () => {
      expect(STILL_APPLIES).toBe("The previous restriction still applies.");
    });
  });
});
