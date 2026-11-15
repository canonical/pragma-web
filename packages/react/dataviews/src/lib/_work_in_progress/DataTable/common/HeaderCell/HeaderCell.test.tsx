/**
 * One header cell, mounted on its own in a header row: the control it
 * renders before and after scripts, how it says the ordering in force, the
 * menu and the resize handle it offers, and where a refusal's reason goes.
 */
import {
  createColumnLayout,
  createGridInteraction,
} from "@canonical/dataviews-core/bindings";
import { fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import createMachineProvider from "../../../../../../testing/createMachineProvider.js";
import type { HeaderCellCaseProps as CaseProps } from "../../../../../../testing/types.js";
import HeaderCell from "./HeaderCell.js";
import type { HeaderCellProps } from "./types.js";

/** No change to the column's place or visibility is on offer. */
const NONE: HeaderCellProps["offers"] = {
  hide: false,
  "move-left": false,
  "move-right": false,
};

/** The table's header row, as it draws it. */
const HeaderRow = ({ children }: { readonly children: ReactNode }) => (
  <table>
    <thead>
      <tr>{children}</tr>
    </thead>
  </table>
);

const mount = (props: CaseProps = {}) => {
  const layout = createColumnLayout({
    columns: [{ id: "name", sizing: { kind: "flex", weight: 1, minPx: 50 } }],
    presentation: createMachineProvider().provider.presentation,
  });
  const callbacks = {
    onSort: vi.fn(),
    onPlace: vi.fn(),
    onRemoveFromSort: vi.fn(),
    onChangeColumn: vi.fn(),
    onClearRefusal: vi.fn(),
    announce: vi.fn(),
  };
  const view = render(
    <HeaderRow>
      <HeaderCell
        column={{ id: "name", header: "Name" }}
        sortable={false}
        precedence={null}
        primary={false}
        destination={null}
        hydrated
        reason={null}
        removable={false}
        offers={NONE}
        interaction={createGridInteraction(layout)}
        resizable={false}
        bounds={{ min: 50, max: Number.POSITIVE_INFINITY }}
        width={120}
        labelId="name-label"
        {...callbacks}
        {...props}
      />
      <button type="button">Elsewhere</button>
    </HeaderRow>,
  );
  return { ...view, ...callbacks };
};

const getHeader = (): HTMLElement =>
  screen.getByRole("columnheader", { name: "Name" });

describe("HeaderCell", () => {
  describe("its control", () => {
    it("is a plain label on a column that does not sort", () => {
      mount();
      expect(getHeader()).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: "Name" })).toBeNull();
      expect(screen.queryByRole("link")).toBeNull();
    });

    it("is a link to the next ordering before scripts take over", () => {
      mount({ sortable: true, hydrated: false, destination: "?sort=name" });
      expect(screen.getByRole("link", { name: "Name" })).toHaveAttribute(
        "href",
        "?sort=name",
      );
      expect(
        screen.queryByRole("button", { name: /Column options/ }),
      ).toBeNull();
    });

    it("is a plain label before scripts where there is nowhere to lead", () => {
      mount({ sortable: true, hydrated: false });
      expect(screen.queryByRole("link")).toBeNull();
      expect(getHeader()).toBeInTheDocument();
    });

    it("sorts by the column alone on a click, and as a further term with Shift", () => {
      const { onSort } = mount({ sortable: true });
      const sort = screen.getByRole("button", { name: "Name" });
      fireEvent.click(sort);
      expect(onSort).toHaveBeenLastCalledWith("name", false);
      fireEvent.click(sort, { shiftKey: true });
      expect(onSort).toHaveBeenLastCalledWith("name", true);
    });

    it("adds a further term on Shift with Enter or Space, whose click carries no modifier", () => {
      const { onSort } = mount({ sortable: true });
      const sort = screen.getByRole("button", { name: "Name" });
      fireEvent.keyDown(sort, { key: "Enter", shiftKey: true });
      fireEvent.click(sort, { detail: 0 });
      expect(onSort).toHaveBeenLastCalledWith("name", true);
      fireEvent.keyUp(sort, { key: "Enter" });
      fireEvent.click(sort, { detail: 0 });
      expect(onSort).toHaveBeenLastCalledWith("name", false);
    });

    it("forgets a held Shift once a key other than an activation is pressed, or focus leaves", () => {
      const { onSort } = mount({ sortable: true });
      const sort = screen.getByRole("button", { name: "Name" });
      fireEvent.keyDown(sort, { key: " ", shiftKey: true });
      fireEvent.blur(sort);
      fireEvent.click(sort, { detail: 0 });
      expect(onSort).toHaveBeenLastCalledWith("name", false);
      fireEvent.keyDown(sort, { key: "a", shiftKey: true });
      fireEvent.keyUp(sort, { key: "a" });
      fireEvent.click(sort, { detail: 0 });
      expect(onSort).toHaveBeenLastCalledWith("name", false);
    });
  });

  describe("the ordering in force", () => {
    it("claims the sort, and says its direction and precedence", () => {
      mount({
        sortable: true,
        primary: true,
        precedence: { direction: "desc", position: 2, count: 3 },
      });
      expect(getHeader()).toHaveAttribute("aria-sort", "descending");
      expect(
        screen.getByRole("button", { name: "Name" }),
      ).toHaveAccessibleDescription("descending, 2nd of 3");
      expect(getHeader()).toHaveTextContent("2");
    });

    it("leaves the claim to the ordering's first column", () => {
      mount({
        sortable: true,
        precedence: { direction: "asc", position: 1, count: 1 },
      });
      expect(getHeader()).not.toHaveAttribute("aria-sort");
      expect(
        screen.getByRole("button", { name: "Name" }),
      ).toHaveAccessibleDescription("ascending");
    });

    it("describes a header with no control of its own itself", () => {
      mount({ precedence: { direction: "asc", position: 1, count: 1 } });
      expect(getHeader()).toHaveAccessibleDescription("ascending");
    });
  });

  describe("a refusal's reason", () => {
    // jsdom's document never has focus; the cell tells the window losing
    // focus from the column losing it by asking.
    beforeEach(() => {
      vi.spyOn(document, "hasFocus").mockReturnValue(true);
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("stands beside the control while focus stays in the column", () => {
      const { onClearRefusal } = mount({
        sortable: true,
        reason: "This source cannot sort by name.",
      });
      expect(getHeader()).toHaveTextContent("This source cannot sort by name.");
      fireEvent.blur(screen.getByRole("button", { name: "Name" }), {
        relatedTarget: screen.getByRole("button", { name: /Column options/ }),
      });
      expect(onClearRefusal).not.toHaveBeenCalled();
    });

    it("goes once focus leaves the column", () => {
      const { onClearRefusal } = mount({ sortable: true, reason: "Refused." });
      fireEvent.blur(screen.getByRole("button", { name: "Name" }), {
        relatedTarget: screen.getByRole("button", { name: "Elsewhere" }),
      });
      expect(onClearRefusal).toHaveBeenCalledTimes(1);
    });

    it("stays when the window loses focus rather than the column", () => {
      const { onClearRefusal } = mount({ sortable: true, reason: "Refused." });
      vi.mocked(document.hasFocus).mockReturnValue(false);
      fireEvent.blur(screen.getByRole("button", { name: "Name" }));
      expect(onClearRefusal).not.toHaveBeenCalled();
    });
  });

  describe("its reason as a popover", () => {
    const showPopover = vi.fn();
    const hidePopover = vi.fn();

    beforeEach(() => {
      Object.assign(HTMLElement.prototype, { showPopover, hidePopover });
      vi.stubGlobal("CSS", { supports: () => true });
    });

    afterEach(() => {
      Reflect.deleteProperty(HTMLElement.prototype, "showPopover");
      Reflect.deleteProperty(HTMLElement.prototype, "hidePopover");
      vi.unstubAllGlobals();
      showPopover.mockClear();
      hidePopover.mockClear();
    });

    /** Draw the cell again with these props, as the table does. */
    const redraw = (
      rerender: (ui: ReactNode) => void,
      props: Partial<HeaderCellProps>,
    ) =>
      rerender(
        <HeaderRow>
          <HeaderCell
            column={{ id: "name", header: "Name" }}
            sortable
            precedence={null}
            primary={false}
            destination={null}
            hydrated
            reason={null}
            removable={false}
            offers={NONE}
            interaction={createGridInteraction(
              createColumnLayout({
                columns: [],
                presentation: createMachineProvider().provider.presentation,
              }),
            )}
            resizable={false}
            bounds={{ min: 50, max: Number.POSITIVE_INFINITY }}
            width={120}
            labelId="name-label"
            onSort={() => {}}
            onPlace={() => {}}
            onRemoveFromSort={() => {}}
            onChangeColumn={() => {}}
            onClearRefusal={() => {}}
            announce={() => {}}
            {...props}
          />
        </HeaderRow>,
      );

    it("is a manual popover in the cell, beside the control", () => {
      mount({ sortable: true, reason: "Refused." });
      const reason = getHeader().querySelector(":scope > .sort-reason");
      expect(reason?.tagName).toBe("SPAN");
      expect(reason).toHaveAttribute("popover", "manual");
      expect(reason).toHaveTextContent("Refused.");
    });

    it("shows on the cell while the reason stands, and hides once it goes", () => {
      const { rerender } = mount({ sortable: true });
      expect(showPopover).not.toHaveBeenCalled();
      redraw(rerender, { reason: "Refused." });
      redraw(rerender, { reason: "Refused again." });
      expect(showPopover).toHaveBeenCalledTimes(1);
      expect(showPopover).toHaveBeenCalledWith({ source: getHeader() });
      redraw(rerender, { reason: null });
      expect(hidePopover).toHaveBeenCalledTimes(1);
    });

    it("shows a reason again once its span is drawn anew", () => {
      const { rerender } = mount({ sortable: true, reason: "Refused." });
      expect(showPopover).toHaveBeenCalledTimes(1);
      redraw(rerender, { sortable: false, reason: "Refused." });
      redraw(rerender, { sortable: true, reason: "Refused." });
      expect(showPopover).toHaveBeenCalledTimes(2);
    });

    it("leaves the reason in the cell where anchoring is unsupported", () => {
      vi.stubGlobal("CSS", { supports: () => false });
      mount({ sortable: true, reason: "Refused." });
      expect(showPopover).not.toHaveBeenCalled();
    });

    it("leaves the reason in the cell where CSS cannot be asked", () => {
      vi.unstubAllGlobals();
      vi.stubGlobal("CSS", undefined);
      mount({ sortable: true, reason: "Refused." });
      expect(showPopover).not.toHaveBeenCalled();
    });

    it("leaves the reason in the cell where there is no popover API", () => {
      Reflect.deleteProperty(HTMLElement.prototype, "showPopover");
      vi.unstubAllGlobals();
      mount({ sortable: true, reason: "Refused." });
      expect(getHeader().querySelector(".sort-reason")).toHaveTextContent(
        "Refused.",
      );
    });

    it("sits beside the menu whose open state hides it", () => {
      mount({ sortable: true, reason: "Refused." });
      fireEvent.click(
        screen.getByRole("button", { name: "Column options for Name" }),
      );
      // The stylesheet hides the reason while the column's menu is open.
      expect(
        getHeader().querySelector(
          ':scope > .menu > .trigger[aria-expanded="true"]',
        ),
      ).not.toBeNull();
      expect(getHeader().querySelector(":scope > .sort-reason")).not.toBeNull();
    });
  });

  describe("its menu and handle", () => {
    it("offers a menu once scripts run, wherever it has something to do", () => {
      mount({ offers: { ...NONE, hide: true } });
      expect(
        screen.getByRole("button", { name: "Column options for Name" }),
      ).toBeInTheDocument();
    });

    it("offers no menu for a column that can be neither sorted, hidden nor moved", () => {
      mount();
      expect(
        screen.queryByRole("button", { name: /Column options/ }),
      ).toBeNull();
    });

    it("offers a resize handle named by the header once scripts run", () => {
      mount({ resizable: true });
      expect(screen.getByRole("separator", { name: "Name" })).toHaveAttribute(
        "aria-valuenow",
        "120",
      );
    });

    it("offers no resize handle before scripts run, only its hidden place", () => {
      mount({ resizable: true, hydrated: false });
      expect(screen.queryByRole("separator")).toBeNull();
      expect(
        getHeader().querySelector(":scope > .handle-slot"),
      ).toHaveAttribute("aria-hidden", "true");
    });

    it("keeps no place for a column that does not resize", () => {
      mount({ hydrated: false });
      expect(getHeader().querySelector(".handle-slot")).toBeNull();
    });
  });

  it("takes the native props of its root, merging the class name", () => {
    mount({ className: "pinned", title: "Machine name" });
    expect(getHeader()).toHaveClass("ds", "data-table-header-cell", "pinned");
    expect(getHeader()).toHaveAttribute("title", "Machine name");
  });
});
