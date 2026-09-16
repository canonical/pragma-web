import {
  createRowScopes,
  readProviderHost,
} from "@canonical/dataviews-core/bindings";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, onTestFinished, vi } from "vitest";
import { deliverRows } from "../../../../../../testing/fixtures.js";
import {
  createMachineProvider,
  machine,
} from "../../../../../../testing/machines.js";
import type { DisplayFieldCellProps } from "../../../../common/index.js";
import { BodyCell } from "./index.js";

/**
 * One row's channels over the given fields, observed so their values are
 * current, and released when the test finishes.
 *
 * @note Impure: observes the provider and its row scopes.
 */
const observeRow = (fields: readonly string[]) => {
  const { provider } = createMachineProvider({
    rows: [machine("m-1", "alpha", "failed", 8)],
  });
  const releaseProvider = provider.observe();
  const scopes = createRowScopes({
    rows: provider.rows,
    selection: provider.selection,
    fields,
  });
  const releaseScopes = scopes.observe();
  onTestFinished(() => {
    releaseScopes();
    releaseProvider();
  });
  return { provider, channels: scopes.readRow("m-1") };
};

/**
 * One row's channels over the given fields, minted as the table mints
 * them. The row is fed to the provider by hand: nothing observes it here.
 */
const channelsOver = (fields: readonly string[]) => {
  const { provider } = createMachineProvider();
  const host = readProviderHost(provider);
  host.complete(host.refresh(), deliverRows([machine("m-1", "alpha")]));
  const scopes = createRowScopes({
    rows: provider.rows,
    selection: provider.selection,
    fields,
  });
  return { provider, channels: scopes.readRow("m-1") };
};

describe("BodyCell", () => {
  it("reports a field no scope channel observes instead of rendering nothing", () => {
    const { provider, channels } = channelsOver(["name"]);
    const failure = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() =>
      render(
        <BodyCell
          provider={provider}
          channels={channels}
          column={{ id: "zone", header: "Zone" }}
          field="zone"
          applicability="applies"
        />,
      ),
    ).toThrow('no channel observes the field "zone"');
    failure.mockRestore();
    expect(screen.queryByRole("cell")).toBeNull();
  });

  it("draws a dash for a field the row's type does not carry, with the word read", () => {
    const { provider, channels } = observeRow(["name"]);
    render(
      <BodyCell
        provider={provider}
        channels={channels}
        column={{ id: "name", header: "Name" }}
        field="name"
        applicability="not-applicable"
      />,
    );
    const cell = screen.getByRole("cell");
    expect(cell).toHaveTextContent(/^—Not applicable$/);
    expect(cell).toHaveAccessibleName("Not applicable");
    expect(cell.querySelector("[aria-hidden='true']")).toHaveTextContent("—");
  });

  it("hands a column's own content the record and its applicability, and no value where the field does not apply", () => {
    const Own = ({ value, record, applicability }: DisplayFieldCellProps) =>
      `${applicability}:${String(value)}:${JSON.stringify(record)}`;
    const { provider, channels } = observeRow(["cores"]);
    const { rerender } = render(
      <BodyCell
        provider={provider}
        channels={channels}
        column={{ id: "cores", header: "Cores", cell: Own }}
        field="cores"
        applicability="applies"
      />,
    );
    expect(screen.getByRole("cell")).toHaveTextContent(
      /^applies:8:\{"id":"m-1","name":"alpha","status":"failed","cores":8\}$/,
    );
    rerender(
      <BodyCell
        provider={provider}
        channels={channels}
        column={{ id: "cores", header: "Cores", cell: Own }}
        field="cores"
        applicability="not-applicable"
      />,
    );
    // The record is still handed over whole: content may draw the state
    // from it, but the field's value is not one the record carries.
    expect(screen.getByRole("cell")).toHaveTextContent(
      /^not-applicable:undefined:\{"id":"m-1"/,
    );
  });
});
