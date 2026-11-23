import type { DataViewsProvider } from "@canonical/dataviews-core";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  buildMachine,
  createMachineProvider,
  type Machine,
  type MachineFields,
  silenceRenderErrors,
} from "../../../../../../testing/index.js";
import RecordList from "./RecordList.js";

describe("RecordList", () => {
  it("observes its own provider and lists its rows", () => {
    const { provider } = createMachineProvider({
      rows: [buildMachine("m-1", "alpha")],
    });
    render(
      <RecordList
        provider={provider}
        label="Machines"
        nameRecord={(record) => record.name}
      />,
    );
    expect(screen.getByRole("listitem")).toHaveTextContent("alpha");
  });

  it("refuses a value that is not a provider", () => {
    silenceRenderErrors();
    expect(() =>
      render(
        <RecordList
          provider={{} as DataViewsProvider<MachineFields, Machine>}
          label="Machines"
          nameRecord={(record) => record.name}
        />,
      ),
    ).toThrow(
      "RecordList requires a provider created by createDataViewsProvider",
    );
  });
});
