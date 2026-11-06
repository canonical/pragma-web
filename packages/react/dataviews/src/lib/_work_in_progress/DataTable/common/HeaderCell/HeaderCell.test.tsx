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
import HeaderCell from "./HeaderCell.js";
import type { HeaderCellProps } from "./types.js";

/** No change to the column's place or visibility is on offer. */
const NONE: HeaderCellProps["offers"] = {
  hide: false,
  "move-left": false,
  "move-right": false,
};

/** The table's header row, as it draws it: a div with the role. */
const HeaderRow = ({ children }: { readonly children: ReactNode }) => (
  // biome-ignore lint/a11y/useSemanticElements: the table's own header row is a div with this role, which the cell sits in
  // biome-ignore lint/a11y/useFocusableInteractive: the row is structure, as the table's is
  <div role="row">{children}</div>
);

/** What a case sets; the rest is a plain, unsorted column. */
type CaseProps = Partial<HeaderCellProps>;

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

const header = (): HTMLElement =>
  screen.getByRole("columnheader", { name: "Name" });

describe("HeaderCell", () => {
  describe("its control", () => {
    it("is a plain label on a column that does not sort", () => {
      mount();
      expect(header()).toBeInTheDocument();
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
      expect(header()).toBeInTheDocument();
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
      expect(header()).toHaveAttribute("aria-sort", "descending");
      expect(
        screen.getByRole("button", { name: "Name" }),
      ).toHaveAccessibleDescription("descending, 2nd of 3");
      expect(header()).toHaveTextContent("2");
    });

    it("leaves the claim to the ordering's first column", () => {
      mount({
        sortable: true,
        precedence: { direction: "asc", position: 1, count: 1 },
      });
      expect(header()).not.toHaveAttribute("aria-sort");
      expect(
        screen.getByRole("button", { name: "Name" }),
      ).toHaveAccessibleDescription("ascending");
    });

    it("describes a header with no control of its own itself", () => {
      mount({ precedence: { direction: "asc", position: 1, count: 1 } });
      expect(header()).toHaveAccessibleDescription("ascending");
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
      expect(header()).toHaveTextContent("This source cannot sort by name.");
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

    it("offers no resize handle before scripts run", () => {
      mount({ resizable: true, hydrated: false });
      expect(screen.queryByRole("separator")).toBeNull();
    });
  });
});
