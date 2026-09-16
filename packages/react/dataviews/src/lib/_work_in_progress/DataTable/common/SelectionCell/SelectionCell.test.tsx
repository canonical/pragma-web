/**
 * The selection cell's one contract a table cannot reach: a row header whose
 * field no scope channel observes is reported, not silently named otherwise.
 */
import { createRowScopes } from "@canonical/dataviews-core/bindings";
import { render } from "@testing-library/react";
import { describe, expect, it, onTestFinished } from "vitest";
import {
  createMachineProvider,
  machine,
} from "../../../../../../testing/machines.js";
import silenceRenderErrors from "../../../../../../testing/silenceRenderErrors.js";
import SelectionCell from "./SelectionCell.js";

describe("SelectionCell", () => {
  it("reports a row header whose field no scope channel observes", () => {
    silenceRenderErrors();
    const { provider } = createMachineProvider({
      rows: [machine("m-1", "alpha")],
    });
    const releaseProvider = provider.observe();
    const scopes = createRowScopes({
      rows: provider.rows,
      selection: provider.selection,
      fields: ["status"],
    });
    const releaseScopes = scopes.observe();
    onTestFinished(() => {
      releaseScopes();
      releaseProvider();
    });
    expect(() =>
      render(
        <SelectionCell
          provider={provider}
          channels={scopes.readRow("m-1")}
          selected={false}
          nameRecord={() => null}
          rowHeader={{ id: "name", header: "Name", rowHeader: true }}
        />,
      ),
    ).toThrow('no channel observes the field "name"');
  });
});
