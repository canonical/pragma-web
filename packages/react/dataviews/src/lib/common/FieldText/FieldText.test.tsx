/**
 * A field's default content: its own field's value spelled as text, and
 * nothing for a value text cannot spell, following the field as it moves.
 */
import {
  createRowScopes,
  readProviderHost,
} from "@canonical/dataviews-core/bindings";
import { act, render } from "@testing-library/react";
import { describe, expect, it, onTestFinished } from "vitest";
import { deliverRows } from "../../../../testing/fixtures.js";
import {
  createMachineProvider,
  type Machine,
  machine,
} from "../../../../testing/machines.js";
import FieldText from "./FieldText.js";

describe("FieldText", () => {
  it("spells the field's value, and follows it", () => {
    const { provider } = createMachineProvider();
    const host = readProviderHost(provider);
    const publish = (rows: readonly Machine[]) => {
      host.complete(host.refresh(), deliverRows(rows));
    };
    publish([machine("m-1", "alpha", "running", 8)]);
    const scopes = createRowScopes({
      rows: provider.rows,
      selection: provider.selection,
      fields: ["cores", "name"],
      readType: () => null,
    });
    onTestFinished(scopes.observe());
    const { fields } = scopes.readRow("m-1");
    const cores = fields["cores"];
    if (cores === undefined) {
      throw new Error("the cores field is observed");
    }
    const { container } = render(<FieldText channel={cores} />);
    expect(container).toHaveTextContent(/^8$/);
    act(() => {
      publish([machine("m-1", "alpha", "running", 16)]);
    });
    expect(container).toHaveTextContent(/^16$/);
  });
});
