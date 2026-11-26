import { createMemoryLocation } from "@canonical/dataviews-core";
import { readProviderHost } from "@canonical/dataviews-core/bindings";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createMachineProvider } from "../../../../../../../../../testing/index.js";
import DataViews from "../../../../../../../_work_in_progress/DataViews/Provider.js";
import { useQueryGroup } from "../../hooks/index.js";
import SummaryButton from "./SummaryButton.js";
import type { SummaryButtonProps } from "./types.js";

/** The button over the root's query group, beside the dialog it shows. */
function Harness(
  props: Omit<SummaryButtonProps, "group" | "sheetId">,
): React.ReactElement {
  return (
    <DataViews provider={fixture.provider}>
      <Connected {...props} />
      <dialog id="sheet">
        <button type="button">Inside</button>
      </dialog>
    </DataViews>
  );
}

function Connected(
  props: Omit<SummaryButtonProps, "group" | "sheetId">,
): React.ReactElement {
  const group = useQueryGroup({ provider: fixture.provider as never });
  return <SummaryButton {...props} group={group} sheetId="sheet" />;
}

let fixture = createMachineProvider();

/**
 * Make the page a browser that runs no invoker command: the shared dialog
 * stand-in leaves a click whose default is prevented alone, so a button's
 * `commandfor` does nothing but what its own handler does.
 *
 * @returns A function that brings invoker commands back.
 */
const withoutInvokers = (): (() => void) => {
  const prevent = (event: Event): void => {
    if (
      event.target instanceof Element &&
      event.target.closest("button[commandfor]") !== null
    ) {
      event.preventDefault();
    }
  };
  document.addEventListener("click", prevent, true);
  return () => document.removeEventListener("click", prevent, true);
};

describe("SummaryButton", () => {
  let uninstall: () => void = () => {};

  afterEach(() => {
    uninstall();
  });

  it("reads Filters alone while none applies", () => {
    fixture = createMachineProvider();
    render(<Harness onShow={() => {}} />);
    const button = screen.getByRole("button", { name: "Filters" });
    expect(button).toHaveAttribute("commandfor", "sheet");
    expect(button).toHaveAttribute("command", "show-modal");
    expect(button).toHaveAttribute("type", "button");
    expect(button).toHaveClass(
      "ds",
      "button",
      "secondary",
      "data-views-query-bar-summary-button",
    );
  });

  it("names the count its Badge shows, a range once and a refusal not at all", () => {
    fixture = createMachineProvider({
      location: createMemoryLocation({
        href: "/m?status=melted&cores__gte=2&cores__lte=8",
      }),
    });
    render(<Harness onShow={() => {}} className="summary" />);
    // The refused status is no filter that applies.
    expect(
      screen.getByRole("button", { name: "Filters, 1 applied" }),
    ).toBeInTheDocument();
    act(() => {
      readProviderHost(fixture.provider).setPredicate({
        field: "status",
        operator: "isAny",
        operands: ["running"],
      });
    });
    const button = screen.getByRole("button", { name: "Filters, 2 applied" });
    expect(button).toHaveClass("summary");
    expect(button.querySelector(".ds.badge")).toHaveAttribute(
      "aria-hidden",
      "true",
    );
    act(() => {
      fixture.provider.setSearch("alder");
    });
    expect(
      screen.getByRole("button", { name: "Filters, 2 applied" }),
    ).toBeInTheDocument();
  });

  it("calls onShow, then shows the sheet, on a click", () => {
    uninstall = withoutInvokers();
    fixture = createMachineProvider();
    const onShow = vi.fn();
    const onClick = vi.fn();
    const { container } = render(<Harness onShow={onShow} onClick={onClick} />);
    const dialog = container.querySelector("dialog") as HTMLDialogElement;
    onShow.mockImplementation(() => {
      expect(dialog.open).toBe(false);
    });
    const summary = screen.getByRole("button", { name: "Filters" });
    fireEvent.click(summary);
    expect(onClick).toHaveBeenCalledOnce();
    expect(onShow).toHaveBeenCalledOnce();
    expect(dialog.open).toBe(true);
    // Focused by its own click, it takes focus back as the sheet closes.
    dialog.close();
    expect(summary).toHaveFocus();
  });
});
