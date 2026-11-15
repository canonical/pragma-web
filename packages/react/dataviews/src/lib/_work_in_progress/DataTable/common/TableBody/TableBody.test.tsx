import { listDisplayEntries } from "@canonical/dataviews-core/bindings";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import TableBody from "./TableBody.js";

describe("TableBody", () => {
  it("renders each entry in order, inside one row group", () => {
    const entries = listDisplayEntries({ rowIds: ["a", "b"], status: null });
    render(
      <TableBody
        entries={entries}
        renderEntry={(entry) => (
          <span>{entry.kind === "record" ? entry.rowId : ""}</span>
        )}
      />,
    );
    const group = screen.getByRole("rowgroup");
    expect(group).toHaveClass("ds", "data-table-row-group", "body");
    expect(group).toHaveTextContent("ab");
  });

  it("renders again only for new entries or a new renderer", () => {
    const entries = listDisplayEntries({ rowIds: ["a"], status: null });
    const renderEntry = vi.fn(() => <div>row</div>);
    const { rerender } = render(
      <TableBody entries={entries} renderEntry={renderEntry} />,
    );
    rerender(<TableBody entries={entries} renderEntry={renderEntry} />);
    expect(renderEntry).toHaveBeenCalledTimes(1);
    const next = listDisplayEntries({ rowIds: ["a"], status: null });
    rerender(<TableBody entries={next} renderEntry={renderEntry} />);
    expect(renderEntry).toHaveBeenCalledTimes(2);
    const renderAgain = vi.fn(() => <div>row</div>);
    rerender(<TableBody entries={next} renderEntry={renderAgain} />);
    expect(renderAgain).toHaveBeenCalledTimes(1);
  });
});
