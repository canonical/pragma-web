import {
  createRowScopes,
  readProviderHost,
} from "@canonical/dataviews-core/bindings";
import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import buildMachine from "../../../../../../testing/buildMachine.js";
import createMachineProvider from "../../../../../../testing/createMachineProvider.js";
import deliverRows from "../../../../../../testing/deliverRows.js";
import type { DisplayFieldCellProps } from "../../../../common/index.js";
import { BodyCell } from "./index.js";

/**
 * One row's channels over the given fields, minted as the table mints
 * them. The row is fed to the provider by hand: nothing observes it here.
 */
const channelsOver = (fields: readonly string[]) => {
  const { provider } = createMachineProvider();
  const host = readProviderHost(provider);
  host.complete(host.refresh(), deliverRows([buildMachine("m-1", "alpha")]));
  const scopes = createRowScopes({
    rows: provider.rows,
    selection: provider.selection,
    fields,
  });
  return { provider, channels: scopes.readRow("m-1") };
};

/** A body row in a table, where a cell renders as it does in the table. */
const inRow = () => ({
  container: document.body.appendChild(document.createElement("table")),
  wrapper: ({ children }: { readonly children: ReactNode }) => (
    <tbody>
      <tr>{children}</tr>
    </tbody>
  ),
});

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
        />,
      ),
    ).toThrow('no channel observes the field "zone"');
    failure.mockRestore();
    expect(screen.queryByRole("cell")).toBeNull();
  });

  it("renders again for a new value, not for the same props", () => {
    const { provider, channels } = channelsOver(["name"]);
    const drawn = vi.fn(({ value }: DisplayFieldCellProps) => String(value));
    const column = { id: "name", header: "Name", cell: drawn };
    const { rerender } = render(
      <BodyCell
        provider={provider}
        channels={channels}
        column={column}
        field="name"
      />,
      inRow(),
    );
    rerender(
      <BodyCell
        provider={provider}
        channels={channels}
        column={column}
        field="name"
      />,
    );
    expect(drawn).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("cell")).toHaveTextContent("alpha");
  });
});
