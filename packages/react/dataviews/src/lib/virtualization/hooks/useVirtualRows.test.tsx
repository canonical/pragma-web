import { listDisplayEntries } from "@canonical/dataviews-core/bindings";
import { render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import { describe, expect, it, onTestFinished, vi } from "vitest";
import useVirtualRows from "./useVirtualRows.js";

const entries = listDisplayEntries({ rowIds: ["a"], status: null });

const model = { entries: [], ids: [], findRecord: () => undefined };

/** A host that reads the hook but never attaches the body it hands back. */
function Detached(): ReactElement {
  useVirtualRows(entries, 32, model);
  return <div />;
}

/** A host that mounts its one row, marking the body busy while measuring. */
function Attached(): ReactElement {
  const { body, readRowRef, measuring } = useVirtualRows(entries, 32, model);
  return (
    <table>
      <tbody ref={body} aria-busy={measuring}>
        {entries.map((entry) => (
          <tr key={entry.id} ref={readRowRef(entry.id)}>
            <td>{entry.id}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

describe("useVirtualRows", () => {
  it("reports a body that was never mounted rather than reading through it", () => {
    const failure = vi.spyOn(console, "error").mockImplementation(() => {});
    onTestFinished(() => {
      failure.mockRestore();
    });
    expect(() => render(<Detached />)).toThrow(
      "the virtualized body is not mounted",
    );
  });

  it("is measuring while a mounted row awaits its first measurement", () => {
    render(<Attached />);
    expect(screen.getAllByRole("rowgroup").at(0)).toHaveAttribute(
      "aria-busy",
      "true",
    );
  });

  it("is never measuring where nothing can measure", () => {
    vi.stubGlobal("ResizeObserver", undefined);
    onTestFinished(() => {
      vi.unstubAllGlobals();
    });
    render(<Attached />);
    expect(screen.getAllByRole("rowgroup").at(0)).toHaveAttribute(
      "aria-busy",
      "false",
    );
  });
});
