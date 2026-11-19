import { act, fireEvent, render, screen } from "@testing-library/react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { describe, expect, it, onTestFinished } from "vitest";
import useMoreFiltersPin from "./useMoreFiltersPin.js";

/** More filters, drawn as the filters draw it, listing its pinned fields. */
const MoreFilters = ({ marks = "name", shown = ["name", "status"] }) => {
  const { pinned, detailsRef, handleSummaryClick, handleToggle } =
    useMoreFiltersPin({ marks, listShownFields: () => shown });
  return (
    <details
      ref={detailsRef}
      suppressHydrationWarning
      open={pinned !== null}
      onToggle={handleToggle}
    >
      {/* biome-ignore lint/a11y/noStaticElementInteractions: a summary is its disclosure's own control */}
      <summary onClick={handleSummaryClick}>More filters</summary>
      <output>{pinned === null ? "unpinned" : [...pinned].join(",")}</output>
    </details>
  );
};

/** What the disclosure has pinned, as the output reads it. */
const readPinned = (): string | null =>
  document.querySelector("output")?.textContent ?? null;

/** Open or close the disclosure some other way than its summary. */
const toggleDisclosure = (open: boolean): void => {
  const details = document.querySelector("details");
  if (details === null) {
    throw new Error("no disclosure is drawn");
  }
  act(() => {
    details.open = open;
    fireEvent(details, new Event("toggle"));
  });
};

describe("useMoreFiltersPin", () => {
  it("pins the fields shown as the summary opens it, and releases them as it closes", () => {
    render(<MoreFilters />);
    expect(readPinned()).toBe("unpinned");
    const summary = screen.getByText("More filters");
    expect(fireEvent.click(summary)).toBe(false);
    expect(readPinned()).toBe("name,status");
    expect(document.querySelector("details")).toHaveAttribute("open");
    fireEvent.click(summary);
    expect(readPinned()).toBe("unpinned");
  });

  it("places nothing under marks that moved", () => {
    const { rerender } = render(<MoreFilters />);
    fireEvent.click(screen.getByText("More filters"));
    rerender(<MoreFilters marks="status" />);
    expect(readPinned()).toBe("unpinned");
  });

  it("pins as the disclosure opens some other way, and releases as it closes", () => {
    render(<MoreFilters />);
    toggleDisclosure(true);
    expect(readPinned()).toBe("name,status");
    toggleDisclosure(false);
    expect(readPinned()).toBe("unpinned");
  });

  it("keeps the pin the summary placed as the toggle follows", () => {
    const { rerender } = render(<MoreFilters />);
    fireEvent.click(screen.getByText("More filters"));
    rerender(<MoreFilters shown={["name", "status", "cores"]} />);
    toggleDisclosure(true);
    expect(readPinned()).toBe("name,status");
  });

  it("re-pins on a toggle once the marks moved", () => {
    const { rerender } = render(<MoreFilters />);
    fireEvent.click(screen.getByText("More filters"));
    rerender(<MoreFilters marks="status" shown={["status"]} />);
    toggleDisclosure(true);
    expect(readPinned()).toBe("status");
  });

  it("pins a disclosure opened before scripts took over as it hydrates", async () => {
    const container = document.createElement("div");
    container.innerHTML = renderToString(<MoreFilters />);
    document.body.append(container);
    container.querySelector("details")?.setAttribute("open", "");
    const root = await act(async () => hydrateRoot(container, <MoreFilters />));
    onTestFinished(() => {
      act(() => {
        root.unmount();
      });
      container.remove();
    });
    expect(readPinned()).toBe("name,status");
  });

  it("pins nothing as it hydrates a closed disclosure", async () => {
    const container = document.createElement("div");
    container.innerHTML = renderToString(<MoreFilters />);
    document.body.append(container);
    const root = await act(async () => hydrateRoot(container, <MoreFilters />));
    onTestFinished(() => {
      act(() => {
        root.unmount();
      });
      container.remove();
    });
    expect(readPinned()).toBe("unpinned");
  });
});
