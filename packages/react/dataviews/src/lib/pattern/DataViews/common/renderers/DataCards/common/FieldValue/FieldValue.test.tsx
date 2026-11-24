import {
  createRowScopes,
  readProviderHost,
} from "@canonical/dataviews-core/bindings";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, onTestFinished } from "vitest";
import {
  buildMachine,
  createMachineProvider,
  machines,
  observeWorkloadRows,
  silenceRenderErrors,
} from "../../../../../../../../../testing/index.js";
import type { DisplayFieldCellProps } from "../../../../../../../common/index.js";
import {
  useDataViewsCell,
  useDataViewsValue,
} from "../../../../../../../hooks/index.js";
import FieldValue from "./FieldValue.js";

/**
 * A provider answered with one machine, and the channels of its row over
 * the observed fields, released when the test finishes.
 *
 * @note Impure: observes the provider and its row scopes.
 */
const observeRow = (fields: readonly string[]) => {
  const { provider } = createMachineProvider({
    rows: [buildMachine("m-1", "alpha", "failed", 8)],
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

describe("FieldValue", () => {
  it("spells a primitive value as text", () => {
    const { provider, channels } = observeRow(["cores"]);
    const { container } = render(
      <FieldValue
        provider={provider}
        readApplicability={readProviderHost(provider).readApplicability}
        channels={channels}
        field={{ id: "cores", header: "Cores" }}
      />,
    );
    expect(container.textContent).toBe("8");
  });

  it("renders the field's own content inside the value's cell scope", () => {
    const Owner = ({ value, rowId, columnId }: DisplayFieldCellProps) => {
      const cell = useDataViewsCell(machines);
      const record = useDataViewsValue(cell.record);
      return (
        <span>
          {rowId}/{columnId}: {String(value)} on {record.name}
        </span>
      );
    };
    const { provider, channels } = observeRow(["status"]);
    render(
      <FieldValue
        provider={provider}
        readApplicability={readProviderHost(provider).readApplicability}
        channels={channels}
        field={{ id: "state", header: "State", field: "status", cell: Owner }}
      />,
    );
    expect(screen.getByText("m-1/state: failed on alpha")).toBeInTheDocument();
  });

  it("throws for a field its row's channels do not observe", () => {
    silenceRenderErrors();
    const { provider, channels } = observeRow(["name"]);
    expect(() =>
      render(
        <FieldValue
          provider={provider}
          readApplicability={readProviderHost(provider).readApplicability}
          channels={channels}
          field={{ id: "cores", header: "Cores" }}
        />,
      ),
    ).toThrow('no channel observes the field "cores"');
  });

  describe("over records of several types", () => {
    it("draws a dash named not applicable, and hands its own content the record", () => {
      const { provider, scopes, readApplicability } = observeWorkloadRows();
      const { container } = render(
        <>
          <FieldValue
            provider={provider}
            readApplicability={readApplicability}
            channels={scopes.readRow("w-2")}
            field={{ id: "image", header: "Image" }}
          />
          <FieldValue
            provider={provider}
            readApplicability={readApplicability}
            channels={scopes.readRow("w-2")}
            field={{
              id: "kind",
              header: "Kind",
              field: "image",
              cell: ({ record, applicability }) =>
                ` ${record.name}: ${applicability}`,
            }}
          />
        </>,
      );
      expect(container).toHaveTextContent("—Not applicable db: not-applicable");
    });
  });
});
